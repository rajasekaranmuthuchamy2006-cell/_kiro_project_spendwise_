# Technology Constraints

## Allowed

- HTML5 native APIs (localStorage, Date, Intl, etc.)
- CSS3 (custom properties, grid, flexbox, animations, media queries)
- Vanilla JavaScript ES6+ (arrow functions, destructuring, template literals, modules via inline scripts)
- Browser-native form validation attributes (`required`, `min`, `max`, `pattern`, `type`)

## Forbidden

- Any JavaScript framework or library (React, Vue, Angular, jQuery, lodash, etc.)
- Any CSS framework (Bootstrap, Tailwind, etc.)
- npm, yarn, or any package manager
- Webpack, Vite, Rollup, or any build tool
- Any backend runtime (Node.js, Python, PHP, etc.)
- External APIs or network requests
- Web Workers, Service Workers (out of scope)
- Third-party fonts loaded via CDN (use system font stack)

## Browser Support

Target: last 2 major versions of Chrome, Firefox, Safari, and Edge.
No IE11 support required.

## Performance Expectations

- Initial load under 1 second on a standard connection
- localStorage operations complete synchronously — keep payload small
- DOM re-renders are full section refreshes (acceptable for this scale)
- No lazy loading required
