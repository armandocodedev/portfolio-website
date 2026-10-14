(function () {
    'use strict';
    const core = window.AICourseCore;
    const key = 'armandocode-free-ai-progress-v1';
    window.ArmandoI18n = { getLanguage: () => 'es' };
    let progress = core.normalizeProgress(null);
    try { progress = core.normalizeProgress(JSON.parse(localStorage.getItem(key))); } catch { storageWarning(); }
    function storageWarning() { document.getElementById('storage-status').textContent = 'El almacenamiento no está disponible. Puedes continuar, pero el avance se perderá al cerrar esta página.'; }
    function track(event, properties = {}) { try { if (typeof sendAnalyticsEvent === 'function') sendAnalyticsEvent(event, { course_id: core.course, ...properties }); } catch { /* Optional analytics never blocks learning. */ } }
    function save() { try { localStorage.setItem(key, JSON.stringify(progress)); } catch { storageWarning(); } renderProgress(); }
    function renderProgress() {
        document.getElementById('progress').value = progress.completed.length;
        document.getElementById('progress-label').textContent = `${progress.completed.length} de 4 lecciones completadas`;
        document.querySelectorAll('[data-complete]').forEach(button => { const done = progress.completed.includes(button.dataset.complete); button.disabled = done; button.textContent = done ? 'Lección completada' : `Marcar lección ${core.lessons.indexOf(button.dataset.complete) + 1} como completada`; });
        document.getElementById('create-certificate').disabled = !core.eligible(progress);
        document.getElementById('eligibility').textContent = core.eligible(progress) ? `Ya puedes crear tu constancia. Mejor resultado: ${progress.score}/10.` : `Completa las cuatro lecciones y consigue 8/10. Mejor resultado: ${progress.score}/10.`;
    }
    document.querySelectorAll('[data-complete]').forEach(button => button.addEventListener('click', () => { if (!progress.completed.includes(button.dataset.complete)) { const wasEligible=core.eligible(progress); progress.completed.push(button.dataset.complete); save(); track('course_lesson_completed', { lesson_id: button.dataset.complete }); if(!wasEligible && core.eligible(progress)) track('course_completed'); } }));
    const questions = document.getElementById('questions');
    core.questions.forEach((q, i) => {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend'); legend.textContent = `${i + 1}. ${q.text}`; fieldset.append(legend);
        q.options.forEach((text, choice) => { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'radio'; input.name = `q${i}`; input.value = choice; input.required = true; const span = document.createElement('span'); span.textContent = text; label.append(input, span); fieldset.append(label); });
        const explanation = document.createElement('p'); explanation.className = 'feedback'; explanation.hidden = true; explanation.id = `feedback-${i}`; fieldset.append(explanation); questions.append(fieldset);
    });
    const quiz = document.getElementById('quiz');
    quiz.addEventListener('submit', event => {
        event.preventDefault();
        const data = new FormData(quiz);
        const answers = core.questions.map((_, i) => data.has(`q${i}`) ? Number(data.get(`q${i}`)) : -1);
        let score; try { score = core.grade(answers); } catch (error) { document.getElementById('quiz-result').textContent = error.message; return; }
        const wasEligible = core.eligible(progress);
        core.questions.forEach((q, i) => { const explanation = document.getElementById(`feedback-${i}`); const correct = answers[i] === q.answer; explanation.textContent = `${correct ? 'Correcto.' : 'Revisa esta respuesta.'} ${q.explanation} Respuesta: ${q.options[q.answer]}`; explanation.hidden = false; explanation.classList.toggle('wrong', !correct); });
        quiz.querySelectorAll('input,button[type=submit]').forEach(el => { el.disabled = true; });
        document.getElementById('retry').hidden = false;
        progress.score = Math.max(progress.score, score);
        if (score >= 8 && !progress.date) { const now = new Date(); progress.date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; }
        save();
        const result = document.getElementById('quiz-result'); result.textContent = `${score}/10. ${score >= 8 ? 'Autoevaluación aprobada.' : 'Lee los comentarios y vuelve a intentarlo.'} ${progress.completed.length < 4 ? 'Recuerda completar las cuatro lecciones para crear la constancia.' : ''}`; result.focus();
        track('course_quiz_submitted', { score, passed: score >= 8 });
        if (!wasEligible && core.eligible(progress)) track('course_completed');
    });
    document.getElementById('retry').addEventListener('click', () => { quiz.reset(); quiz.querySelectorAll('input,button[type=submit]').forEach(el => { el.disabled = false; }); quiz.querySelectorAll('.feedback').forEach(el => { el.hidden = true; }); document.getElementById('retry').hidden = true; document.getElementById('quiz-result').textContent = ''; quiz.querySelector('input').focus(); });
    document.getElementById('reset').addEventListener('click', () => { if (window.confirm('¿Quieres borrar el avance de este curso en este navegador? Los enlaces de constancias que ya compartiste seguirán existiendo.')) { try { localStorage.removeItem(key); } catch { /* In-memory reset remains available. */ } window.location.reload(); } });
    document.getElementById('certificate-form').addEventListener('submit', event => {
        event.preventDefault(); if (!core.eligible(progress) || !document.getElementById('share-consent').checked) return;
        try { const payload = core.encodeCertificate({ v: 1, course: core.course, name: document.getElementById('learner-name').value.trim(), date: progress.date, score: progress.score }); track('certificate_created'); window.location.assign(`certificate.html#${payload}`); } catch (error) { document.getElementById('certificate-error').textContent = error.message; }
    });
    renderProgress();
}());
