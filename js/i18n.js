(function () {
    'use strict';
    const STORAGE_KEY = 'armandocode-language';
    const messages = {
        en: {
            language: 'Language', home: 'Home', email: 'Email', brandHome: 'Armando Code home',
            homeTitle: "Armando Code | Help Shape What's Next",
            homeDescription: 'Help shape what comes next at Armando Code: AI courses, tutorials, apps, or videogames. Vote and optionally keep in touch.',
            haveYourSay: 'Have your say', interestHeading: 'What would you like to see next?',
            interestBody: 'AI courses, practical tutorials, useful apps, or videogames. Tell me what interests you and help shape what I create next.',
            shareInterests: 'Share your interests',
            surveyNote: "Vote without an email. Leave one only if you'd like occasional updates.",
            surveyTitle: 'Armando Code audience survey', privacyPreferences: 'Privacy & email preferences',
            somethingToTry: 'Something to try', storyBody: 'Play an interactive story. See where your choices take you.',
            playStory: 'Play EchoStory', storyAlt: 'EchoStory interactive story game preview',
            privacy: 'Privacy & Cookies', privacyTitle: 'Privacy & Cookies | Armando Code',
            privacyDescription: 'How Armando Code handles analytics consent, audience survey responses, and optional email updates.',
            privacyIntro: 'How Armando Code handles analytics, survey responses, and email preferences.',
            analytics: 'Analytics',
            analyticsPolicy: 'This site uses PostHog only after you accept analytics tracking. It measures page visits, campaign sources, project selections, and contact clicks. An anonymous browser identifier is stored in local storage to recognize returning visits.',
            analyticsLimits: 'Website analytics does not capture form contents or record sessions. Survey answers and any email address you choose to provide are handled separately as described below. I do not sell your data.',
            languagePolicy: 'Your language choice is saved in this browser independently of analytics consent. Consented analytics events include the selected language.',
            surveyEmail: 'Survey & Email Updates',
            surveyPolicy: 'The audience survey is hosted by PostHog in its US region and loads when you choose to take it. You can vote without accepting website analytics or providing an email address.',
            surveyStorage: 'PostHog stores the answers you submit. If you explicitly choose email updates, it also stores the email address you provide with that response. This permission is separate from analytics consent.',
            emailPolicy: 'Your email will be used for occasional Armando Code releases and content updates. To withdraw permission or request deletion of your survey response, email ',
            emailWithdrawal: '. Withdrawing email permission does not require changing your analytics choice.',
            yourChoice: 'Your Choice',
            choicePolicy: 'You can reject analytics when the cookie banner appears. If you accepted before and want to choose again, use the button below.',
            resetAnalytics: 'Reset analytics choice', contact: 'Contact',
            contactPolicy: 'Questions about this policy can be sent to ', backHome: 'Back to home',
            cookieConsent: 'Cookie consent', analyticsCookies: 'Analytics cookies',
            cookieBody: 'I use PostHog to understand visits and interests. You can vote without accepting analytics.',
            reject: 'Reject', acceptAnalytics: 'Accept analytics',
            light: 'Light', dark: 'Dark', switchLight: 'Switch to light theme', switchDark: 'Switch to dark theme',
            surveyRestart: 'Changing the language will restart the open survey and discard any unsent answers. Continue?',
            restartTitle: 'Change language?', keepLanguage: 'Keep current language', changeLanguage: 'Change language'
        },
        es: {
            language: 'Idioma', home: 'Inicio', email: 'Correo', brandHome: 'Inicio de Armando Code',
            homeTitle: 'Armando Code | Ayuda a decidir qué viene',
            homeDescription: 'Ayuda a decidir qué crear en Armando Code: cursos de IA, tutoriales, apps o videojuegos. Vota y, si quieres, recibe novedades.',
            haveYourSay: 'Da tu opinión', interestHeading: '¿Qué te gustaría ver ahora?',
            interestBody: 'Cursos de IA, tutoriales prácticos, apps útiles o videojuegos. Cuéntame qué te interesa y ayuda a decidir qué crear.',
            shareInterests: 'Comparte tus intereses',
            surveyNote: 'Vota sin dejar tu correo. Déjalo solo si quieres recibir novedades ocasionales.',
            surveyTitle: 'Encuesta de intereses de Armando Code', privacyPreferences: 'Privacidad y preferencias de correo',
            somethingToTry: 'Algo para probar', storyBody: 'Juega una historia interactiva. Descubre adónde te llevan tus decisiones.',
            playStory: 'Jugar EchoStory', storyAlt: 'Vista previa del juego de historias interactivas EchoStory',
            privacy: 'Privacidad y cookies', privacyTitle: 'Privacidad y cookies | Armando Code',
            privacyDescription: 'Cómo Armando Code gestiona el consentimiento de analítica, las respuestas a la encuesta y las novedades opcionales por correo.',
            privacyIntro: 'Cómo Armando Code gestiona la analítica, las respuestas a la encuesta y tus preferencias de correo.',
            analytics: 'Analítica',
            analyticsPolicy: 'Este sitio usa PostHog solo después de que aceptes la analítica. Mide visitas a páginas, fuentes de campañas, proyectos seleccionados y clics de contacto. Se guarda un identificador anónimo del navegador en el almacenamiento local para reconocer visitas posteriores.',
            analyticsLimits: 'La analítica del sitio no captura el contenido de formularios ni graba sesiones. Las respuestas a la encuesta y cualquier correo que decidas proporcionar se gestionan por separado, como se explica a continuación. No vendo tus datos.',
            languagePolicy: 'Tu elección de idioma se guarda en este navegador independientemente del consentimiento de analítica. Los eventos de analítica consentidos incluyen el idioma seleccionado.',
            surveyEmail: 'Encuesta y novedades por correo',
            surveyPolicy: 'La encuesta está alojada en PostHog, en su región de Estados Unidos, y se carga cuando decides participar. Puedes votar sin aceptar la analítica del sitio ni proporcionar un correo.',
            surveyStorage: 'PostHog guarda las respuestas que envías. Si eliges explícitamente recibir novedades por correo, también guarda la dirección que proporcionas con esa respuesta. Este permiso es independiente del consentimiento de analítica.',
            emailPolicy: 'Tu correo se usará para enviarte novedades ocasionales sobre lanzamientos y contenido de Armando Code. Para retirar tu permiso o pedir que se elimine tu respuesta, escribe a ',
            emailWithdrawal: '. Retirar el permiso de correo no requiere cambiar tu elección de analítica.',
            yourChoice: 'Tu elección',
            choicePolicy: 'Puedes rechazar la analítica cuando aparezca el aviso de cookies. Si ya aceptaste y quieres volver a elegir, usa el botón de abajo.',
            resetAnalytics: 'Restablecer elección de analítica', contact: 'Contacto',
            contactPolicy: 'Puedes enviar tus preguntas sobre esta política a ', backHome: 'Volver al inicio',
            cookieConsent: 'Consentimiento de cookies', analyticsCookies: 'Cookies de analítica',
            cookieBody: 'Uso PostHog para entender las visitas y los intereses. Puedes votar sin aceptar la analítica.',
            reject: 'Rechazar', acceptAnalytics: 'Aceptar analítica',
            light: 'Claro', dark: 'Oscuro', switchLight: 'Cambiar al tema claro', switchDark: 'Cambiar al tema oscuro',
            surveyRestart: 'Cambiar el idioma reiniciará la encuesta abierta y descartará las respuestas que no hayas enviado. ¿Continuar?',
            restartTitle: '¿Cambiar el idioma?', keepLanguage: 'Mantener idioma actual', changeLanguage: 'Cambiar idioma'
        },
        'pt-BR': {
            language: 'Idioma', home: 'Início', email: 'E-mail', brandHome: 'Início do Armando Code',
            homeTitle: 'Armando Code | Ajude a escolher o próximo passo',
            homeDescription: 'Ajude a decidir o que criar no Armando Code: cursos de IA, tutoriais, apps ou jogos. Vote e, se quiser, receba novidades.',
            haveYourSay: 'Dê sua opinião', interestHeading: 'O que você gostaria de ver agora?',
            interestBody: 'Cursos de IA, tutoriais práticos, apps úteis ou jogos. Conte o que interessa a você e ajude a decidir o que criar.',
            shareInterests: 'Compartilhe seus interesses',
            surveyNote: 'Vote sem informar seu e-mail. Deixe seu endereço só se quiser receber novidades ocasionais.',
            surveyTitle: 'Pesquisa de interesses do Armando Code', privacyPreferences: 'Privacidade e preferências de e-mail',
            somethingToTry: 'Algo para experimentar', storyBody: 'Jogue uma história interativa. Descubra aonde suas escolhas levam você.',
            playStory: 'Jogar EchoStory', storyAlt: 'Prévia do jogo de histórias interativas EchoStory',
            privacy: 'Privacidade e cookies', privacyTitle: 'Privacidade e cookies | Armando Code',
            privacyDescription: 'Como o Armando Code trata o consentimento de análise, as respostas à pesquisa e as novidades opcionais por e-mail.',
            privacyIntro: 'Como o Armando Code trata as análises, as respostas à pesquisa e suas preferências de e-mail.',
            analytics: 'Análises',
            analyticsPolicy: 'Este site usa o PostHog somente depois que você aceita as análises. Ele mede visitas às páginas, origens de campanhas, projetos selecionados e cliques de contato. Um identificador anônimo do navegador é salvo no armazenamento local para reconhecer visitas futuras.',
            analyticsLimits: 'As análises do site não capturam o conteúdo dos formulários nem gravam sessões. As respostas à pesquisa e qualquer e-mail que você decidir fornecer são tratados separadamente, conforme explicado abaixo. Não vendo seus dados.',
            languagePolicy: 'Sua escolha de idioma é salva neste navegador independentemente do consentimento de análise. Os eventos de análise consentidos incluem o idioma selecionado.',
            surveyEmail: 'Pesquisa e novidades por e-mail',
            surveyPolicy: 'A pesquisa fica hospedada no PostHog, na região dos Estados Unidos, e é carregada quando você decide participar. Você pode votar sem aceitar as análises do site nem informar um e-mail.',
            surveyStorage: 'O PostHog armazena as respostas que você envia. Se você escolher explicitamente receber novidades por e-mail, ele também armazena o endereço fornecido com essa resposta. Essa permissão é independente do consentimento de análise.',
            emailPolicy: 'Seu e-mail será usado para enviar novidades ocasionais sobre lançamentos e conteúdo do Armando Code. Para retirar sua permissão ou pedir a exclusão da sua resposta, escreva para ',
            emailWithdrawal: '. Retirar a permissão de e-mail não exige alterar sua escolha de análise.',
            yourChoice: 'Sua escolha',
            choicePolicy: 'Você pode rejeitar as análises quando o aviso de cookies aparecer. Se já aceitou e quer escolher novamente, use o botão abaixo.',
            resetAnalytics: 'Redefinir escolha de análise', contact: 'Contato',
            contactPolicy: 'Envie suas dúvidas sobre esta política para ', backHome: 'Voltar ao início',
            cookieConsent: 'Consentimento de cookies', analyticsCookies: 'Cookies de análise',
            cookieBody: 'Uso o PostHog para entender as visitas e os interesses. Você pode votar sem aceitar as análises.',
            reject: 'Rejeitar', acceptAnalytics: 'Aceitar análises',
            light: 'Claro', dark: 'Escuro', switchLight: 'Mudar para o tema claro', switchDark: 'Mudar para o tema escuro',
            surveyRestart: 'Mudar o idioma reiniciará a pesquisa aberta e descartará as respostas que ainda não foram enviadas. Continuar?',
            restartTitle: 'Mudar o idioma?', keepLanguage: 'Manter idioma atual', changeLanguage: 'Mudar idioma'
        }
    };

    function normalizeLanguage(value) {
        const primary = String(value || '').toLowerCase().split('-')[0];
        return primary === 'pt' ? 'pt-BR' : ['en', 'es'].includes(primary) ? primary : null;
    }

    function chooseLanguage(saved, browserLanguages) {
        return normalizeLanguage(saved) ||
            browserLanguages.map(normalizeLanguage).find(Boolean) || 'en';
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { messages, normalizeLanguage, chooseLanguage };
    }
    if (typeof document === 'undefined') return;

    let saved;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (error) { /* Storage may be blocked. */ }
    let language = chooseLanguage(saved, navigator.languages || [navigator.language]);
    const t = key => messages[language][key] ?? messages.en[key] ?? key;

    function applyTranslations() {
        document.documentElement.lang = language;
        const attributes = { 'data-i18n-aria-label': 'aria-label', 'data-i18n-title': 'title',
            'data-i18n-alt': 'alt', 'data-i18n-content': 'content' };
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = t(element.dataset.i18n);
        });
        Object.entries(attributes).forEach(([marker, attribute]) => {
            document.querySelectorAll('[' + marker + ']').forEach(element => {
                element.setAttribute(attribute, t(element.getAttribute(marker)));
            });
        });
        document.querySelectorAll('[data-language-select]').forEach(select => { select.value = language; });
    }

    function setLanguage(value) {
        const next = normalizeLanguage(value) || 'en';
        if (next === language) return;
        const previous = language;
        language = next;
        try { localStorage.setItem(STORAGE_KEY, language); } catch (error) { /* Keep the in-memory choice. */ }
        applyTranslations();
        document.dispatchEvent(new CustomEvent('armandocode:languagechange', { detail: { language, previous } }));
    }

    window.ArmandoI18n = { t, getLanguage: () => language, setLanguage };
    applyTranslations();
    const dialog = document.querySelector('[data-language-dialog]');
    let pendingLanguage = null;
    if (dialog) {
        dialog.querySelector('[data-keep-language]').addEventListener('click', () => {
            pendingLanguage = null;
            dialog.close();
        });
        dialog.querySelector('[data-confirm-language]').addEventListener('click', () => {
            const next = pendingLanguage;
            pendingLanguage = null;
            dialog.close();
            if (next) setLanguage(next);
        });
        dialog.addEventListener('cancel', () => { pendingLanguage = null; });
    }
    document.querySelectorAll('[data-language-select]').forEach(select => {
        select.addEventListener('change', () => {
            const frame = document.querySelector('.audience-survey-frame');
            if (frame && !frame.hidden && dialog) {
                pendingLanguage = select.value;
                select.value = language;
                dialog.showModal();
                return;
            }
            setLanguage(select.value);
        });
    });
}());
