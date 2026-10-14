(function () {
    'use strict';
    const core = window.AICourseCore;
    let certificate;
    try { certificate = core.decodeCertificate(location.hash.slice(1)); } catch { document.getElementById('invalid').hidden = false; return; }
    const date = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeZone:'UTC' }).format(new Date(certificate.date + 'T12:00:00Z'));
    document.getElementById('certificate-content').hidden = false;
    document.getElementById('certificate-name').textContent = certificate.name;
    document.getElementById('certificate-score').textContent = `${certificate.score}/10 · Mínimo: 8/10`;
    document.getElementById('certificate-date').textContent = date;
    const shareLink = document.getElementById('share-link');
    shareLink.value = `${location.origin}${location.pathname}#${core.encodeCertificate(certificate)}`;
    document.getElementById('print').addEventListener('click', () => window.print());
    document.getElementById('share').addEventListener('click', async () => {
        const status = document.getElementById('share-status');
        try {
            if (navigator.share) { await navigator.share({ title:'Mi minicurso de IA · Armando Code', text:'Mi constancia autodeclarada de Primeros pasos con IA. El curso es gratuito.', url:shareLink.value }); status.textContent = 'Enlace compartido.'; }
            else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareLink.value); status.textContent = 'Enlace copiado.'; }
            else { shareLink.focus(); shareLink.select(); status.textContent = 'El enlace está seleccionado para copiarlo.'; }
        } catch (error) { if (error.name !== 'AbortError') { shareLink.focus(); shareLink.select(); status.textContent = 'No se pudo compartir automáticamente. Puedes copiar el enlace seleccionado.'; } }
    });
    document.getElementById('download').addEventListener('click', () => {
        try {
            const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1120;
            const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,1600,1120); ctx.fillStyle = '#126357'; ctx.fillRect(0,0,1600,22); ctx.strokeStyle = '#b7ccc4'; ctx.strokeRect(24,24,1552,1072);
            function line(text,y,size,color='#172a29',weight='400') { ctx.textAlign='center'; ctx.fillStyle=color; ctx.font=`${weight} ${size}px sans-serif`; ctx.fillText(text,800,y); }
            line('ARMANDO CODE',100,25,'#172a29','700'); line('CONSTANCIA DE FINALIZACIÓN',190,22,'#126357','700');
            line('Primeros pasos con IA',275,58,'#172a29','700'); line('Prompts útiles y uso responsable',325,28);
            line('Se deja constancia de que',420,24);
            let size=54; do { ctx.font=`700 ${size}px sans-serif`; if(ctx.measureText(certificate.name).width<=1400) break; size--; } while(size>18);
            line(certificate.name,495,size,'#126357','700');
            line('declara haber completado las cuatro lecciones y la autoevaluación',575,25); line('del minicurso gratuito de Armando Code.',615,25);
            line(`Autoevaluación: ${certificate.score}/10  ·  Fecha declarada: ${date}`,710,25,'#172a29','700'); line('Español · A tu ritmo · Edición 2026',760,23);
            line('Finalización autodeclarada. Sin verificación de identidad ni examen supervisado.',865,20,'#516361');
            line('No es una titulación oficial ni una certificación profesional.',900,20,'#516361');
            line('No existe un registro verificable; los datos compartidos pueden ser modificados.',935,20,'#516361');
            line('Curso gratuito: armandocode.com/courses/primeros-pasos-ia/',1030,23,'#126357','700');
            canvas.toBlob(blob => { if(!blob) { document.getElementById('share-status').textContent='No se pudo crear la imagen. Prueba imprimir o guardar como PDF.'; return; }const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='armando-code-constancia-ia.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000); },'image/png');
        } catch { document.getElementById('share-status').textContent='No se pudo crear la imagen. Prueba imprimir o guardar como PDF.'; }
    });
}());
