# Coding Guidelines

## HTML

- Use semantic HTML5 elements (`<main>`, `<section>`, `<header>`, `<nav>`, `<article>`, `<form>`)
- Every form control must have an associated `<label>` (explicit `for`/`id` pairing)
- Use ARIA roles and attributes where native semantics are insufficient
- All interactive elements must be keyboard-navigable
- Images and icons must have `alt` text or `aria-hidden="true"` for decorative ones
- Use `<button type="button">` for non-submit actions

## CSS

- Mobile-first responsive design using CSS Grid and Flexbox
- Use CSS custom properties (variables) for the design system (colors, spacing, typography)
- No inline styles except for dynamically computed values set via JavaScript
- Media breakpoints: 480px (mobile), 768px (tablet), 1024px (desktop)
- Accessible color contrast ratios (minimum WCAG AA: 4.5:1 for text)

## JavaScript

- Strict mode enabled: `'use strict';`
- All data mutations go through dedicated data-layer functions
- No direct DOM manipulation from data functions — keep concerns separated
- Use `const` by default, `let` only when reassignment is needed, never `var`
- Descriptive function and variable names (no abbreviations except well-known ones)
- All localStorage reads wrapped in try/catch for resilience
- Input sanitized before storing or displaying (prevent XSS)
- All calculations derived from stored data, never from DOM values

## Accessibility

- Minimum AA color contrast
- Focus indicators visible for all interactive elements
- Screen reader announcements for dynamic content changes via `aria-live` regions
- Form validation messages associated with inputs via `aria-describedby`

## Code Organization (script.js)

Sections in order:
1. Constants and configuration
2. State management
3. localStorage helpers
4. Data layer (CRUD operations)
5. Calculation functions
6. Render / UI update functions
7. Event handlers
8. Initialization
