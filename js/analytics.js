// Public browser token; never use a PostHog personal API key here.
const POSTHOG_PROJECT_TOKEN = 'phc_pf7Jq9LC438Q3UVQWFWh2Cs7c93ohEcrJQ9eKUJmxD5J';
const ANALYTICS_CONSENT_KEY = 'armandocode-posthog-consent';
const CAMPAIGN_STORAGE_KEY = 'armandocode-campaign-context';
let posthogStarted = false;
let consentChoice;
let pageviewCaptured = false;
let posthogReady = false;
let courseStartCaptured = false;

function isProductionAnalyticsHost() {
    return ['armandocode.com', 'www.armandocode.com'].includes(window.location.hostname);
}

function hasAnalyticsConsent() {
    if (!isProductionAnalyticsHost()) return false;
    if (consentChoice) return consentChoice === 'accepted';
    try { return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted'; }
    catch { return false; }
}

function getCampaignContext() {
    const params = new URLSearchParams(window.location.search);
    const campaignContext = {
        page_path: window.location.pathname,
        page_location: window.location.origin + window.location.pathname,
        referrer: document.referrer ? new URL(document.referrer).origin : 'direct',
        site_area: window.location.pathname.startsWith('/courses/') ? 'course' : window.location.pathname.startsWith('/lab') ? 'lab' : 'website',
        site_language: window.ArmandoI18n?.getLanguage() || 'en'
    };

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
        const value = params.get(key);
        if (value) campaignContext[key] = value;
    });

    return campaignContext;
}

function storeCampaignContext() {
    const context = getCampaignContext();
    const hasCampaign = Object.keys(context).some(key => key.startsWith('utm_'));

    if (hasCampaign) {
        try {
            sessionStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(context));
        } catch (error) {
            // Campaign attribution can fall back to this page when storage is unavailable.
        }
    }
}

function readCampaignContext() {
    const currentContext = getCampaignContext();
    try {
        const savedContext = JSON.parse(sessionStorage.getItem(CAMPAIGN_STORAGE_KEY)) || {};
        const campaign = Object.fromEntries(Object.entries(savedContext).filter(([key]) => key.startsWith('utm_')));
        return { ...campaign, ...currentContext };
    } catch (error) {
        return currentContext;
    }
}

function loadPostHog() {
    if (!hasAnalyticsConsent()) return;
    if (posthogStarted) {
        window.posthog.opt_in_capturing();
        if (posthogReady && !pageviewCaptured) captureCurrentPage();
        return;
    }
    posthogStarted = true;

    // Official PostHog snippet: queues events while the browser SDK loads.
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split('.');2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement('script')).type='text/javascript',p.crossOrigin='anonymous',p.async=!0,p.src=s.api_host.replace('.i.posthog.com','-assets.i.posthog.com')+'/static/array.js',(r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],Object.defineProperty(u,'toString',{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e='posthog';return'posthog'!==a&&(e+='.'+a),t||(e+=' (stub)'),e}}),Object.defineProperty(u.people,'toString',{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+'.people (stub)'}}),o='init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(' '),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    window.posthog.init(POSTHOG_PROJECT_TOKEN, {
        api_host: 'https://us.i.posthog.com',
        ui_host: 'https://us.posthog.com',
        defaults: '2026-05-30',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_performance: false,
        capture_dead_clicks: false,
        capture_heatmaps: false,
        capture_exceptions: false,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_feature_flags: true,
        person_profiles: 'identified_only',
        persistence: 'localStorage',
        before_send: event => hasAnalyticsConsent() ? event : null,
        loaded: client => {
            posthogReady = true;
            if (!hasAnalyticsConsent()) {
                client.opt_out_capturing();
                return;
            }
            client.opt_in_capturing();
            client.register({
                site_name: 'armandocode',
                site_environment: 'production',
                ...readCampaignContext()
            });
            captureCurrentPage(client);
        }
    });
}

function captureCurrentPage(client = window.posthog) {
    client.capture('$pageview', readCampaignContext());
    pageviewCaptured = true;
    if (!courseStartCaptured && ['/courses/primeros-pasos-ia/', '/courses/primeros-pasos-ia/index.html'].includes(window.location.pathname)) {
        client.capture('course_started', { ...readCampaignContext(), course_id: 'primeros-pasos-ia-v1' });
        courseStartCaptured = true;
    }
}

function setAnalyticsConsent(choice) {
    consentChoice = choice;
    try { localStorage.setItem(ANALYTICS_CONSENT_KEY, choice); } catch { /* Keep the explicit choice for this page. */ }
    document.querySelector('.cookie-banner')?.setAttribute('hidden', '');

    if (choice === 'accepted') {
        loadPostHog();
    } else if (posthogStarted) {
        window.posthog.opt_out_capturing();
        pageviewCaptured = false;
    }
}

function initAnalyticsConsent() {
    storeCampaignContext();

    let savedChoice;
    try { savedChoice = localStorage.getItem(ANALYTICS_CONSENT_KEY); } catch { /* Show the banner when storage is unavailable. */ }
    const banner = document.querySelector('.cookie-banner');

    if (savedChoice === 'accepted') {
        loadPostHog();
    } else if (!savedChoice && banner) {
        banner.removeAttribute('hidden');
    }

    document.querySelectorAll('[data-cookie-choice]').forEach(button => {
        button.addEventListener('click', () => {
            setAnalyticsConsent(button.dataset.cookieChoice);
        });
    });

    document.querySelectorAll('[data-reset-cookie-choice]').forEach(button => {
        button.addEventListener('click', () => {
            window.posthog?.opt_out_capturing();
            consentChoice = 'rejected';
            try { localStorage.removeItem(ANALYTICS_CONSENT_KEY); } catch {}
            window.location.reload();
        });
    });

    initTrackedLinks();
    initAudienceSurvey();
    window.addEventListener('pagehide', () => {
        if (pageviewCaptured && hasAnalyticsConsent()) {
            window.posthog.capture('$pageleave', readCampaignContext(), { transport: 'sendBeacon' });
        }
        pageviewCaptured = false;
    });
    window.addEventListener('pageshow', event => {
        if (event.persisted && hasAnalyticsConsent() && posthogStarted && !pageviewCaptured) {
            window.posthog.capture('$pageview', readCampaignContext());
            pageviewCaptured = true;
        }
    });
    document.addEventListener('armandocode:languagechange', () => {
        sendAnalyticsEvent('language_changed');
        document.querySelectorAll('[data-survey-section]').forEach(container => {
            const frame = container.querySelector('iframe');
            if (!frame.hidden) frame.src = getAudienceSurveyUrl(container);
        });
    });
}

function sendAnalyticsEvent(eventName, eventParams = {}) {
    if (!hasAnalyticsConsent()) return;
    if (typeof window.posthog?.capture !== 'function') return;

    window.posthog.capture(eventName, {
        ...readCampaignContext(),
        ...eventParams
    });
}

function initTrackedLinks() {
    // Delegation also captures links rendered after the portfolio data loads.
    document.addEventListener('click', event => {
        const element = event.target.closest?.('[data-analytics-event]');
        if (!element) return;

        sendAnalyticsEvent(element.dataset.analyticsEvent, {
            app_slug: element.dataset.appSlug,
            project_type: element.dataset.projectType,
            cta: element.dataset.cta,
            destination: safeAnalyticsDestination(element),
            link_text: element.textContent.trim()
        });
    });
}

function safeAnalyticsDestination(element) {
    if (element.protocol === 'mailto:') return 'email';
    try {
        const url = new URL(element.getAttribute('href'), window.location.origin);
        return url.origin + url.pathname;
    } catch { return ''; }
}

function getAudienceSurveyUrl(container) {
    const surveyUrl = new URL(container.dataset.surveyUrl);
    const campaign = readCampaignContext();
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
        if (campaign[key]) surveyUrl.searchParams.set(key, campaign[key]);
    });
    surveyUrl.searchParams.set('display_language', campaign.site_language.toLowerCase());
    return surveyUrl.href;
}

function initAudienceSurvey() {
    document.querySelectorAll('[data-open-survey]').forEach(button => {
        button.addEventListener('click', () => {
            const container = button.closest('[data-survey-section]');
            const frame = container.querySelector('iframe');
            frame.src = getAudienceSurveyUrl(container);
            frame.hidden = false;
            button.hidden = true;
            sendAnalyticsEvent('survey_opened', { survey_id: '01a128be-13a6-0000-17ac-1c9d3c1e719f' });
        }, { once: true });
    });
}

document.addEventListener('DOMContentLoaded', initAnalyticsConsent);
