# Armando Code

A static audience-research website built with HTML, CSS, and JavaScript and hosted on GitHub Pages. The homepage and Lab prioritize an interest survey and optional email updates. EchoStory is the secondary experience; other experiments are tucked into a collapsed list on the Lab.

## Features

- Responsive design that works on all devices
- Clean, modern aesthetic
- Audience-interest survey with optional email updates
- EchoStory as a secondary experience, with other projects kept low-key

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

Tracked events include `$pageview`, `open_lab`, `select_project`, `contact_click`, `cta_click`, and `survey_opened`. Properties include the current page, `site_name`, `site_area`, `site_environment`, campaign tags, and the selected project/CTA. Local browser checks use `site_environment=preview`; filter to `production` for launch reporting.

The audience survey is managed at https://us.posthog.com/project/497274/surveys/01a128be-13a6-0000-17ac-1c9d3c1e719f. It was launched with explicit approval on October 10, 2026 (Buenos Aires). It is a hosted form loaded on request from the homepage or Lab. The embed forwards campaign tags but does not pass a visitor identifier; responses are not linked to an individual website visitor's activity.

People can vote without an email. Email updates require an explicit Yes answer, followed by an email address. These choices are stored as survey responses, not confirmed mailing-list subscriptions. Email delivery, confirmation, and automated unsubscribing are not configured; requests currently go to the contact email listed in the survey and privacy policy.

Run the consent, attribution, and page-priority checks with `node --test tests/*.test.cjs`.

Instagram bio link: `https://armandocode.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio`. Use a distinct `utm_campaign` or `utm_content` for individual posts.
