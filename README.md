# Armando Code

A static audience-research website built with HTML, CSS, and JavaScript and hosted on GitHub Pages. The homepage prioritizes an interest survey and optional email updates, followed by courses and resources linked to MelonPlace, and EchoStory.

## Features

- Responsive design that works on all devices
- Clean, modern aesthetic
- Audience-interest survey with optional email updates
- Localized course previews and campaign-tagged MelonPlace store links
- EchoStory as a secondary experience

## Routes

- `/`: audience-interest survey, optional email updates, courses and resources, and EchoStory.
- `/privacy.html`: privacy policy, analytics consent reset, and email contact.
- `/lab/` and `/lab/reserva/`: retired pages retained only as client-side redirects to the homepage. Redirects preserve query parameters, including Instagram UTM tags, and discard obsolete section anchors. Without JavaScript, a meta refresh and home link provide a fallback, but campaign query forwarding requires JavaScript.

Both content pages load consent-gated PostHog analytics. Redirect stubs do not load analytics or count an extra pageview; the destination page records the visit after consent. These are static-hosting redirects, not HTTP 301 responses.

## Development

This site uses vanilla HTML, CSS, and JavaScript for maximum performance and simplicity.

### Project Structure

```
portfolio-website/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Stylesheet
├── js/
│   └── script.js       # JavaScript functionality
└── .nojekyll           # Disables Jekyll processing on GitHub Pages
```

## GitHub Pages Setup

To enable GitHub Pages for this repository:

1. Go to the repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "Deploy from a branch"
4. Select the "main" branch and "/ (root)" folder
5. Click "Save"

Your site will be published to https://[your-username].github.io/portfolio-website/

## Custom Domain Setup

To use your custom domain with this GitHub Pages site:

1. Go to the repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Custom domain", enter your domain name
4. Click "Save"
5. Update your domain's DNS settings to point to GitHub Pages

## Calendly Integration

To add Calendly scheduling functionality:

1. Create a Calendly account
2. Get your Calendly username or scheduling link
3. Uncomment and update the Calendly integration code in `js/script.js`
4. Push your changes

## License

This project is available for personal use.

## Analytics and Audience Survey

The website uses PostHog project `497274` (US region). Its public browser token and SDK configuration live in `js/analytics.js`; personal API keys must never be committed. Website tracking waits for the `armandocode-posthog-consent` choice, independently of the earlier GA4 consent. Autocapture, session replay, and automatic survey popups are disabled on this website.

Current tracked events include `$pageview`, `select_project`, `contact_click`, and `survey_opened`. Historical `open_lab` and `cta_click` events remain in PostHog. Properties include the current page, `site_name`, `site_area`, `site_environment`, campaign tags, and the selected project/CTA. Local browser checks use `site_environment=preview`; filter to `production` for launch reporting.

The audience survey is managed at https://us.posthog.com/project/497274/surveys/01a128be-13a6-0000-17ac-1c9d3c1e719f. It was launched with explicit approval on October 10, 2026 (Buenos Aires). It is a hosted form loaded on request from the homepage. The embed forwards campaign tags but does not pass a visitor identifier; responses are not linked to an individual website visitor's activity.

People can vote without an email. Email updates require an explicit Yes answer, followed by an email address. These choices are stored as survey responses, not confirmed mailing-list subscriptions. Email delivery, confirmation, and automated unsubscribing are not configured; requests currently go to the contact email listed in the survey and privacy policy.

Run the consent, attribution, and page-priority checks with `node --test tests/*.test.cjs`.

Instagram bio link: `https://armandocode.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio`. Use a distinct `utm_campaign` or `utm_content` for individual posts.

## MelonPlace Store

The homepage Courses & Resources section links to the published avatar course
and the Armando Code MelonPlace storefront. The Instagram AI course links to its
published USD 9 offer. Payment is coordinated with the seller and Google Drive
access is granted manually after confirmation.

The free Spanish mini-course at `/courses/primeros-pasos-ia/` includes four lessons,
ten explained questions, retries, and browser-local progress. All lessons and
at least 8/10 unlock a self-reported completion certificate. The certificate is
not accredited, supervised, identity-verified, signed, or backed by a registry.
Its separate viewer loads no analytics. Sharing explicitly exposes the entered
name, score and date in a URL fragment; recipients can modify it, and shared
links cannot be revoked. PNG export and browser print-to-PDF are available.

Course analytics requires the existing consent. Events: `course_opened`,
`course_lesson_completed`, `course_quiz_submitted`, `course_completed`, and
`certificate_created`. No names or individual answers are sent. Learners can
finish without consent or registration. Storage failures fall back to memory.

Outgoing store links use `utm_source=armandocode.com`, `utm_medium=website`,
`utm_campaign=courses`, and placement-specific `utm_content`. They do not copy
incoming query parameters or visitor identifiers. Existing consent-gated
analytics records `store_visit` events. These tags do not by themselves verify
cross-domain purchases or replace MelonPlace's native tracked-link reporting.

Website Spanish links open the Spanish store; English and Portuguese website
links open the English store. Only Spanish and English storefront language
values have been verified. Course language is stated separately from website
language. Cover images are stored locally under `assets/courses/`.

## Languages

The homepage and privacy page support English (`en`), Latin American Spanish (`es`), and Brazilian Portuguese (`pt-BR`). The accessible native language selector remembers an explicit choice in `armandocode-language` local storage, independently of analytics consent. On a first visit, the first supported browser language is used; English is the fallback. If browser storage is blocked, switching still works for the current page.

`js/i18n.js` contains the UI translations, including metadata, image descriptions, consent copy, and theme labels. Both content pages load it before analytics. Consented events include `site_language`; manual changes generate `language_changed` without an extra pageview.

The existing PostHog survey has native `es` and `pt-br` translations for all three questions, choices, email guidance, and confirmation messages. The embed uses `display_language` to match the website. Changing language with an open survey asks before restarting it and discarding unsent answers. PostHog currently retains English platform-owned hints and navigation labels such as "Select all that apply" and "Submit survey"; these are not website translations. Question IDs and email opt-in branching remain unchanged.

## Ada Mascot

The homepage includes a decorative, in-flow Ada beside the survey heading. `js/ada.js` selects the sixteen compact-atlas rectangles directly from `assets/ada/frame-map.json`, using clockwise-from-up pointer angles, a 24 CSS-pixel dead zone, and 3-degree sector hysteresis. Pointer updates are coalesced with requestAnimationFrame; only changed poses redraw. No idle blink, cursor chasing, 3D renderer, or new dependency is included.

The supplied PNGs are copied unchanged. The neutral PNG stays available without JavaScript and is used on pointer exit, touch-only devices, reduced motion, or asset failure. Only eligible desktop pointers load the compact atlas; the full atlas is not included or requested. Source identity is retained in `assets/ada/PROVENANCE.txt`.

Intersection/visibility checks pause offscreen or hidden mascots. Removing the element or leaving the page disconnects observers, listeners, pending image callbacks, and animation frames; back-forward cache restores mount fresh instances. The decorative container is aria-hidden, has no focus targets, and never intercepts pointer clicks. CSS reserves its space rather than overlaying controls.
