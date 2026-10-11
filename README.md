# Armando Code

A static audience-research website built with HTML, CSS, and JavaScript and hosted on GitHub Pages. The homepage prioritizes an interest survey and optional email updates. EchoStory is the secondary experience.

## Features

- Responsive design that works on all devices
- Clean, modern aesthetic
- Audience-interest survey with optional email updates
- EchoStory as a secondary experience

## Routes

- `/`: audience-interest survey, optional email updates, and EchoStory.
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

## Ada Mascot

The homepage includes a decorative, in-flow Ada beside the survey heading. `js/ada.js` selects the sixteen compact-atlas rectangles directly from `assets/ada/frame-map.json`, using clockwise-from-up pointer angles, a 24 CSS-pixel dead zone, and 3-degree sector hysteresis. Pointer updates are coalesced with requestAnimationFrame; only changed poses redraw. No idle blink, cursor chasing, 3D renderer, or new dependency is included.

The supplied PNGs are copied unchanged. The neutral PNG stays available without JavaScript and is used on pointer exit, touch-only devices, reduced motion, or asset failure. Only eligible desktop pointers load the compact atlas; the full atlas is not included or requested. Source identity is retained in `assets/ada/PROVENANCE.txt`.

Intersection/visibility checks pause offscreen or hidden mascots. Removing the element or leaving the page disconnects observers, listeners, pending image callbacks, and animation frames; back-forward cache restores mount fresh instances. The decorative container is aria-hidden, has no focus targets, and never intercepts pointer clicks. CSS reserves its space rather than overlaying controls.
