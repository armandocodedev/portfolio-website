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
    document.getElementById('download').addEventListener('click', async () => {
        try {
            await document.fonts.ready;
            const loadLogo = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
            const logo = await loadLogo('/assets/brand/library/armandocode-logo-horizontal-dark-color.svg');
            const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1120;
            const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,1600,1120); ctx.fillStyle = '#7c15a7'; ctx.fillRect(0,0,1600,22); ctx.fillStyle='#b710c2';ctx.fillRect(1120,0,480,22);ctx.strokeStyle = '#e2d7eb'; ctx.strokeRect(24,24,1552,1072);
            ctx.drawImage(logo,679,55,242,67);
            function line(text,y,size,color='#1f2937',weight='400',family='Inter') { ctx.textAlign='center'; ctx.fillStyle=color; ctx.font=`${weight} ${size}px "${family}", sans-serif`; ctx.fillText(text,800,y); }
            line('CONSTANCIA DE FINALIZACIÓN',190,22,'#7c15a7','600','IBM Plex Mono');
            line('Primeros pasos con IA',275,58,'#1f2937','700','Space Grotesk'); line('Prompts útiles y uso responsable',325,28);
            line('Se deja constancia de que',420,24);
            let size=54; do { ctx.font=`700 ${size}px "Space Grotesk", sans-serif`; if(ctx.measureText(certificate.name).width<=1400) break; size--; } while(size>18);
            line(certificate.name,495,size,'#7c15a7','700','Space Grotesk');
            line('declara haber completado las cuatro lecciones y la autoevaluación',575,25); line('del minicurso gratuito de Armando Code.',615,25);
            line(`Autoevaluación: ${certificate.score}/10  ·  Fecha declarada: ${date}`,710,25,'#1f2937','700'); line('Español · A tu ritmo · Edición 2026',760,23);
            line('Finalización autodeclarada. Sin verificación de identidad ni examen supervisado.',865,20,'#667085');
            line('No es una titulación oficial ni una certificación profesional.',900,20,'#667085');
            line('No existe un registro verificable; los datos compartidos pueden ser modificados.',935,20,'#667085');
            line('Curso gratuito: armandocode.com/courses/primeros-pasos-ia/',1030,23,'#7c15a7','600','IBM Plex Mono');
            canvas.toBlob(blob => { if(!blob) { document.getElementById('share-status').textContent='No se pudo crear la imagen. Prueba imprimir o guardar como PDF.'; return; }const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='armando-code-constancia-ia.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000); },'image/png');
        } catch { document.getElementById('share-status').textContent='No se pudo crear la imagen. Prueba imprimir o guardar como PDF.'; }
    });
}());
