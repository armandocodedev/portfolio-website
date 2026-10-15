const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
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
        for(const asset of ['armandocode-logo-horizontal-light-color.svg','armandocode-logo-horizontal-dark-color.svg']) assert.ok(html.includes('/assets/brand/library/'+asset));
        assert.match(html,/\/css\/course-brand\.css/);
        assert.match(html,/Space\+Grotesk/);
        assert.match(html,/theme-toggle/);
    }
    const brand=fs.readFileSync(path.join(__dirname,'../css/course-brand.css'),'utf8');
    const site=fs.readFileSync(path.join(__dirname,'../css/style.css'),'utf8');
    for(const color of ['#7c15a7','#b710c2','#d894ff']) { assert.ok(brand.includes(color)); assert.ok(site.includes(color)); }
    const certificate=fs.readFileSync(path.join(__dirname,'../courses/primeros-pasos-ia/certificate.js'),'utf8');
    assert.match(certificate,/ctx\.drawImage\(logo/);assert.match(certificate,/library\/armandocode-logo-horizontal-dark-color\.svg/);
    assert.doesNotMatch(certificate,/#126357|#172a29/);
});

test('course palette and type agree with the imported brand-library reference', () => {
    const tokens=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/brand/library/brand-tokens.json'),'utf8'));
    const css=fs.readFileSync(path.join(__dirname,'../css/course-brand.css'),'utf8');
    const roots=css.match(/:root\s*\{([^}]+)\}/)[1];
    const dark=css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)[1];
    function declarations(body) { return Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m=>[m[1],m[2].replaceAll(' ','').toLowerCase()])); }
    const lightValues=declarations(roots), darkValues={...lightValues,...declarations(dark)};
    for(const key of ['--primary-color','--accent-color','--brand-soft-color','--text-color','--muted-color','--page-bg','--panel-bg','--panel-soft-bg','--line-color','--header-bg','--font-body','--font-heading','--font-mono']) assert.ok(key in lightValues,key);
    for(const [mode,values] of [['light',lightValues],['dark',darkValues]]) {
        for(const [key,value] of Object.entries(tokens.websiteCssVariables[mode])) if(key in values) assert.equal(values[key],value.replaceAll(' ','').toLowerCase(),`${mode} ${key}`);
    }
    assert.equal(darkValues['--cta-bg'],tokens.observedComponents.homepageDarkCta.background.toLowerCase());
    assert.equal(darkValues['--cta-text'],tokens.observedComponents.homepageDarkCta.text.toLowerCase());
});

test('canonical logos are unchanged copies of the audited brand library', () => {
    const expected={
        'armandocode-logo-horizontal-light-color.svg':'7ae63209d5393bd8d7518469f9d2e63070560d984e883748d6d3b5d9ac5d1851',
        'armandocode-logo-horizontal-dark-color.svg':'9d16ffa2e10ddb8d8668ae7b79b7977d3db55ae4c637b3ce02b710e88de9fc75'
    };
    for(const [file,hash] of Object.entries(expected)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../assets/brand/library',file))).digest('hex'),hash);
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
