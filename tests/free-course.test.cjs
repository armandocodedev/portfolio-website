const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../courses/primeros-pasos-ia/core.js');
test('quiz has ten explained questions and one valid answer each', () => {
    assert.equal(core.questions.length,10);
    core.questions.forEach(q => { assert.ok(q.options[q.answer]); assert.ok(q.explanation.length>40); });
    assert.equal(core.grade(core.questions.map(q=>q.answer)),10);
    assert.equal(core.grade(core.questions.map(q=>(q.answer+1)%3)),0);
    assert.throws(()=>core.grade([]));assert.throws(()=>core.grade(Array(10).fill(-1)));
});
test('certificate requires four lessons and at least eight correct answers', () => {
    const progress={version:1,completed:[...core.lessons],score:8,date:'2026-10-14'};
    assert.equal(core.eligible(progress),true);
    assert.equal(core.eligible({...progress,score:7}),false);
    assert.equal(core.eligible({...progress,completed:core.lessons.slice(1)}),false);
    assert.equal(core.eligible({...progress,date:''}),false);
    assert.deepEqual(core.normalizeProgress({version:1,completed:['invalid','criterio','criterio'],score:20,date:'2026-02-30'}),{version:1,completed:['criterio'],score:0,date:''});
    assert.equal(core.normalizeProgress({version:2,completed:core.lessons,score:10}).score,0);
});
test('share payload round-trips Unicode and rejects malformed or oversized input', () => {
    const value={v:1,course:core.course,name:'María 李',date:'2026-10-14',score:8};
    assert.deepEqual(core.decodeCertificate(core.encodeCertificate(value)),value);
    for(const invalid of ['', '%%%','a'.repeat(2001)]) assert.throws(()=>core.decodeCertificate(invalid));
    for(const changes of [{name:''},{name:'x'.repeat(71)},{name:'a\nb'},{date:'2026-02-30'},{score:7},{course:'other'}]) assert.throws(()=>core.encodeCertificate({...value,...changes}));
});
test('certificate viewer has no analytics and uses text-safe rendering', () => {
    const html=fs.readFileSync(path.join(__dirname,'../courses/primeros-pasos-ia/certificate.html'),'utf8');
    const js=fs.readFileSync(path.join(__dirname,'../courses/primeros-pasos-ia/certificate.js'),'utf8');
    assert.doesNotMatch(html+js,/analytics\.js|posthog|innerHTML|insertAdjacentHTML/);
    assert.match(html,/noindex,nofollow/);assert.match(html,/no-referrer/);assert.match(html,/autodeclarada/);
    assert.match(js,/\.textContent = certificate.name/);
});

test('course and certificate reuse real brand assets and website typography', () => {
    for(const file of ['index.html','certificate.html']) {
        const html=fs.readFileSync(path.join(__dirname,'../courses/primeros-pasos-ia',file),'utf8');
        for(const asset of ['armandocode-mark.svg','armandocode-wordmark-light.svg','armandocode-wordmark-dark.svg']) assert.ok(html.includes('/assets/brand/'+asset));
        assert.match(html,/\/css\/course-brand\.css/);
        assert.match(html,/Space\+Grotesk/);
        assert.match(html,/theme-toggle/);
    }
    const brand=fs.readFileSync(path.join(__dirname,'../css/course-brand.css'),'utf8');
    const site=fs.readFileSync(path.join(__dirname,'../css/style.css'),'utf8');
    for(const color of ['#7c15a7','#b710c2','#d894ff']) { assert.ok(brand.includes(color)); assert.ok(site.includes(color)); }
    const certificate=fs.readFileSync(path.join(__dirname,'../courses/primeros-pasos-ia/certificate.js'),'utf8');
    assert.match(certificate,/ctx\.drawImage\(mark/); assert.match(certificate,/ctx\.drawImage\(wordmark/);
    assert.doesNotMatch(certificate,/#126357|#172a29/);
});

test('course theme follows the existing site preference and persists changes', () => {
    const source=fs.readFileSync(path.join(__dirname,'../courses/primeros-pasos-ia/brand.js'),'utf8');
    for(const blocked of [false,true]) {
        const storage={};let click;
        const root={dataset:{}};
        const button={textContent:'',setAttribute(){},addEventListener(event,handler){click=handler;}};
        vm.runInNewContext(source,{
            document:{documentElement:root,querySelectorAll:()=>[button]},
            window:{matchMedia:()=>({matches:false})},
            localStorage:{getItem(key){assert.equal(key,'portfolio-theme');if(blocked)throw Error('blocked');return 'dark';},setItem(key,value){if(blocked)throw Error('blocked');storage[key]=value;}}
        });
        assert.equal(root.dataset.theme,blocked?'light':'dark');
        click();assert.equal(root.dataset.theme,blocked?'dark':'light');
        if(!blocked)assert.equal(storage['portfolio-theme'],'light');
    }
});
