# Armandocode Reference

Source: `D:/Projects/brand-library/armandocode`, reviewed October 15, 2026.
The library itself was not edited.

These SVGs and `brand-tokens.json` are byte-for-byte copies of the canonical
library assets. Use `light-color` on dark surfaces and `dark-color` on light
surfaces. The certificate viewer, print version, and PNG export use the dark
color logo on white. No reconstructed mark or invented wordmark is used.

SHA-256:

- Horizontal light color: `7ae63209d5393bd8d7518469f9d2e63070560d984e883748d6d3b5d9ac5d1851`
- Horizontal dark color: `9d16ffa2e10ddb8d8668ae7b79b7977d3db55ae4c637b3ce02b710e88de9fc75`

The course uses the library's general light/dark theme tokens, not the homepage
background overrides. Body: Inter 400; headings: Space Grotesk 700; labels and
buttons: IBM Plex Mono 700. Primary buttons have 6px corners and white on deep
purple in light mode, dark text on lavender in dark mode.

`assets/courses/primeros-pasos-ia-library-preview.jpg` is a screenshot of the real
course quiz, not generated readable UI. It replaces the warm stock-style desk
image in the course, homepage card and MelonPlace listing. Older images remain
in source history/assets but are not selected as the free-course cover.

Regression checks in `tests/free-course.test.cjs` compare the course's declared
colors and font stacks with the imported token JSON. The course remains a free,
self-paced introduction; certificates remain self-reported, non-accredited and
without identity verification or a signed registry.
