(function (root) {
    'use strict';
    const course = 'primeros-pasos-ia-v1';
    const lessons = ['criterio', 'prompts', 'revision', 'flujo'];
    const questions = [
        { text: 'Una IA escribe una respuesta muy segura. ¿Qué significa?', options: ['Que ya comprobó los hechos.', 'Que todavía puede contener errores.', 'Que sirve como fuente primaria.'], answer: 1, explanation: 'Un texto convincente puede contener datos inventados. La seguridad del tono no demuestra exactitud.' },
        { text: '¿Cuál es el mejor encargo para preparar una publicación?', options: ['Haz algo viral.', 'Escribe algo bueno.', 'Propón tres ideas para una panadería de barrio, con tono cercano y máximo 50 palabras por idea.'], answer: 2, explanation: 'El objetivo, el contexto, la audiencia y los límites permiten evaluar si la respuesta cumple el encargo.' },
        { text: '¿Qué conviene hacer con una lista privada de clientes?', options: ['Usar datos ficticios para practicar.', 'Pegar nombres y teléfonos completos.', 'Compartirla si la herramienta es gratuita.'], answer: 0, explanation: 'Para este ejercicio no hacen falta datos personales. Usa ejemplos ficticios y evita subir información confidencial.' },
        { text: 'La respuesta es demasiado larga. ¿Qué revisión ayuda?', options: ['Repetir el mismo mensaje sin cambios.', 'Pedir una versión de 80 palabras, manteniendo los tres puntos esenciales.', 'Aceptar el resultado porque lo escribió una IA.'], answer: 1, explanation: 'Una revisión concreta cambia una condición medible y conserva lo que ya funciona.' },
        { text: 'La IA cita una estadística sin enlace verificable. ¿Qué haces?', options: ['Publicarla porque parece precisa.', 'Añadir un porcentaje parecido.', 'Buscar la fuente original y quitar el dato si no puedes comprobarlo.'], answer: 2, explanation: 'Pedir una fuente no garantiza que exista. Abre la fuente original y comprueba que realmente respalde el dato.' },
        { text: '¿Cómo conviertes una idea en un encargo evaluable?', options: ['Defines objetivo, audiencia, contexto y formato.', 'Pides que sea perfecto.', 'Añades muchos adjetivos sin explicar la tarea.'], answer: 0, explanation: 'Un encargo evaluable deja claro para quién es el resultado, qué debe conseguir y cómo debe entregarse.' },
        { text: '¿Quién decide si una publicación está lista?', options: ['La herramienta, por haberla generado.', 'Una persona que revise hechos, tono y permisos.', 'El primer comentario que reciba.'], answer: 1, explanation: 'La revisión humana mantiene la responsabilidad por lo que se publica. Automatizar la redacción no sustituye ese juicio.' },
        { text: '¿Qué incluye una buena revisión de una imagen generada?', options: ['Solo comprobar que tenga colores bonitos.', 'Suponer que cualquier uso está permitido.', 'Revisar errores visibles, posibles usos engañosos y permisos aplicables.'], answer: 2, explanation: 'Revisa el resultado y las condiciones aplicables al uso previsto. Una imagen generada no elimina por sí sola los problemas de derechos o de representación.' },
        { text: '¿Qué práctica ayuda a mejorar un proceso repetible?', options: ['Guardar una plantilla sin datos privados y anotar qué revisar.', 'Cambiar todas las condiciones a la vez sin comparar.', 'Publicar automáticamente cualquier resultado.'], answer: 0, explanation: 'Una plantilla y una lista de revisión hacen el proceso más consistente. Compara versiones cambiando una condición cada vez.' },
        { text: '¿Qué acredita el certificado de este minicurso?', options: ['Una titulación oficial.', 'Una finalización autodeclarada con autoevaluación, sin examen supervisado.', 'Una identidad verificada y experiencia profesional.'], answer: 1, explanation: 'Es una constancia de un curso introductorio de Armando Code. No es una titulación, una verificación de identidad ni una certificación profesional.' }
    ];
    function grade(answers) {
        if (!Array.isArray(answers) || answers.length !== questions.length || answers.some((a, i) => !Number.isInteger(a) || a < 0 || a >= questions[i].options.length)) throw new Error('Responde las diez preguntas.');
        return questions.reduce((score, q, i) => score + Number(answers[i] === q.answer), 0);
    }
    function normalizeProgress(value) {
        const clean = { version: 1, completed: [], score: 0, date: '' };
        if (!value || value.version !== 1) return clean;
        clean.completed = lessons.filter(id => Array.isArray(value.completed) && value.completed.includes(id));
        clean.score = Number.isInteger(value.score) && value.score >= 0 && value.score <= 10 ? value.score : 0;
        clean.date = validDate(value.date) ? value.date : '';
        return clean;
    }
    function eligible(progress) { return lessons.every(id => progress.completed.includes(id)) && progress.score >= 8 && validDate(progress.date); }
    function validDate(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value;
    }
    function validateCertificate(value) {
        if (!value || value.v !== 1 || value.course !== course || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 70 || /[\u0000-\u001f\u007f]/.test(value.name) || !validDate(value.date) || !Number.isInteger(value.score) || value.score < 8 || value.score > 10) throw new Error('El enlace del certificado no es válido.');
        return { v: 1, course, name: value.name.trim(), date: value.date, score: value.score };
    }
    function encodeCertificate(value) {
        const bytes = new TextEncoder().encode(JSON.stringify(validateCertificate(value)));
        return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
    }
    function decodeCertificate(hash) {
        if (typeof hash !== 'string' || hash.length > 2000 || !/^[A-Za-z0-9_-]+$/.test(hash)) throw new Error('El enlace del certificado no es válido.');
        const bytes = Uint8Array.from(atob(hash.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
        return validateCertificate(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
    }
    const api = { course, lessons, questions, grade, normalizeProgress, eligible, encodeCertificate, decodeCertificate };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.AICourseCore = api;
}(typeof window !== 'undefined' ? window : this));
