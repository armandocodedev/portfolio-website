const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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
