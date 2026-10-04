# SpendWise – Smart Expense Tracker

## Project Purpose

SpendWise is a client-side personal finance tracking web application. It allows users to record income and expense transactions, set monthly budgets, visualize spending by category, and manage their financial history — all without a backend or API.

## Technology Constraints

- Vanilla HTML5, CSS3, and JavaScript (ES6+) only
- No frameworks (no React, Vue, Angular, etc.)
- No backend, no server, no build tools
- No npm packages or CDN libraries beyond standard browser APIs
- Data persistence via localStorage only
- Must work offline in any modern browser

## Three-File Structure

The entire application MUST be contained in exactly three files:

| File | Purpose |
|------|---------|
| `index.html` | App structure, semantic markup, accessibility attributes |
| `style.css` | All styling — layout, responsiveness, theming |
| `script.js` | All logic — data, calculations, DOM, events |

Additional files are ONLY permitted for:
- `.kiro/specs/` — specification documents
- `.kiro/steering/` — steering documents
- `.kiro/hooks/` — hook configurations
- `.kiro/specs/spendwise/.config.kiro` — spec config

## MCP Status

No MCP server is currently configured in this environment. A documentation MCP server (e.g. `@modelcontextprotocol/server-filesystem` or a custom docs server) can be added to `.kiro/settings/mcp.json` if needed. MCP is optional and not required for this application.
