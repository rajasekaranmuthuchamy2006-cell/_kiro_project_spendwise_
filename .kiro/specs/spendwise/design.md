# Design Document – SpendWise Smart Expense Tracker

## Overview

SpendWise is a single-page application (SPA) delivered as three static files: `index.html`, `style.css`, and `script.js`. There is no build step, no server, and no external dependencies. All state lives in `localStorage` and all rendering is synchronous DOM manipulation driven by vanilla JavaScript.

---

## Architecture

### File Responsibilities

| File | Role |
|------|------|
| `index.html` | Semantic document structure, all ARIA annotations, form markup, placeholder containers for dynamic content |
| `style.css` | Design system (CSS variables), layout (Grid + Flexbox), responsive breakpoints, component styles, animations |
| `script.js` | Application state, localStorage I/O, calculation functions, DOM renderers, event handlers, initialization |

### Data Flow

```
User Action
    │
    ▼
Event Handler (script.js)
    │
    ▼
Data Layer (CRUD + validation)
    │
    ├──► localStorage (persist)
    │
    ▼
Render Functions (update DOM)
    │
    ▼
Updated UI
```

---

## Data Model

### Transaction Object

```js
{
  id: string,          // crypto.randomUUID() or Date.now().toString()
  type: 'income' | 'expense',
  amount: number,      // positive float, stored as-is
  category: string,    // one of CATEGORIES[type]
  date: string,        // ISO 8601 date: "YYYY-MM-DD"
  description: string  // free text, max 100 chars
}
```

### Budget Object (per month key)

```js
// Key: "budget_YYYY-MM"
// Value: number (monthly limit in USD)
```

### localStorage Keys

| Key | Value |
|-----|-------|
| `spendwise_transactions` | JSON array of Transaction objects |
| `budget_YYYY-MM` | number (monthly budget for that month) |

---

## Module Structure (script.js)

### 1. Constants & Configuration

```js
const CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'],
  expense: ['Food', 'Transport', 'Housing', 'Healthcare', 'Entertainment',
            'Shopping', 'Education', 'Utilities', 'Other Expense']
};
const STORAGE_KEY = 'spendwise_transactions';
const BUDGET_PREFIX = 'budget_';
const BUDGET_WARN_THRESHOLD = 0.8;  // 80%
```

### 2. Application State

```js
let state = {
  transactions: [],    // loaded from localStorage on init
  editingId: null,     // ID of transaction being edited, or null
  filters: {
    search: '',
    type: 'all',
    category: 'all'
  },
  currentMonth: ''     // "YYYY-MM" for budget/chart scope
};
```

### 3. localStorage Helpers

- `loadTransactions()` → `Transaction[]` — reads + parses, returns `[]` on error
- `saveTransactions(transactions)` — serializes + writes
- `loadBudget(monthKey)` → `number | null`
- `saveBudget(monthKey, amount)` — writes budget

### 4. Data Layer

- `addTransaction(data)` — creates object with UUID, pushes to state, saves
- `updateTransaction(id, data)` — finds by id, merges data, saves
- `deleteTransaction(id)` — filters out by id, saves
- `getFilteredTransactions()` → applies `state.filters` to `state.transactions`

### 5. Calculation Functions

- `calcTotals(transactions)` → `{ income, expenses, balance }`
- `calcMonthlyTotals(transactions, monthKey)` → `{ income, expenses }`
- `calcCategoryBreakdown(transactions, monthKey)` → `{ [category]: amount }`
- `calcBudgetStatus(expenses, budget)` → `{ percent, status: 'ok'|'warn'|'exceeded' }`
- `groupByMonth(transactions)` → `{ [YYYY-MM]: { income, expenses } }`

### 6. Render Functions

- `renderSummaryCards()` — updates income/expense/balance card values
- `renderTransactionList()` — renders filtered transaction rows
- `renderCategoryChart()` — renders CSS bar chart for current month
- `renderMonthlySummary()` — renders month-by-month summary table
- `renderBudgetSection()` — renders progress bar + status message
- `renderAll()` — calls all render functions

### 7. Event Handlers

- Form submit → validate → add or update transaction → renderAll
- Type select change → repopulate category dropdown
- Edit button → populate form with transaction data, set `state.editingId`
- Delete button → confirm dialog → deleteTransaction → renderAll
- Search/filter inputs → update `state.filters` → renderTransactionList
- Budget save button → saveBudget → renderBudgetSection

### 8. Initialization

```js
document.addEventListener('DOMContentLoaded', () => {
  state.transactions = loadTransactions();
  state.currentMonth = getCurrentMonthKey();
  populateCategoryDropdown('expense');
  renderAll();
  attachEventListeners();
});
```

---

## UI Layout

### Page Structure (index.html)

```
<body>
  <header>              ← App name + nav tabs (Dashboard / Add)
  <main>
    <section#summary>   ← Three summary cards
    <section#form>      ← Transaction form (add/edit)
    <section#budget>    ← Budget input + progress bar
    <section#history>   ← Search/filter bar + transaction list
    <section#chart>     ← Category breakdown bars
    <section#monthly>   ← Monthly summary table
  </main>
  <footer>
```

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 480px | Single column, stacked cards |
| 480–768px | 2-column summary cards |
| 768–1024px | 2-column main layout (form + history side by side) |
| > 1024px | Full dashboard grid |

---

## Design System (CSS Variables)

```css
:root {
  --color-primary:     #4f46e5;  /* Indigo */
  --color-success:     #10b981;  /* Green  */
  --color-danger:      #ef4444;  /* Red    */
  --color-warning:     #f59e0b;  /* Amber  */
  --color-bg:          #f8fafc;
  --color-surface:     #ffffff;
  --color-text:        #1e293b;
  --color-text-muted:  #64748b;
  --color-border:      #e2e8f0;
  --radius:            8px;
  --shadow:            0 1px 3px rgba(0,0,0,.1);
  --font:              -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

---

## Correctness Properties

These properties can be verified manually or via browser console testing:

### P1: Balance Invariant
For any set of transactions, `calcTotals(transactions).balance === income - expenses`.
This must hold after every add, edit, and delete operation.

### P2: Data Round-Trip
For any valid transaction array `T`:
`JSON.parse(JSON.stringify(T))` must deep-equal `T`.
Verified by: save transactions → reload page → loaded transactions equal original.

### P3: Filter Monotonicity (Metamorphic)
Adding a filter constraint must never increase the number of displayed transactions.
`filtered(moreConstraints).length <= filtered(fewerConstraints).length`

### P4: Category Percentages Sum to 100
For any month with expense transactions:
`sum(Object.values(calcCategoryBreakdown(...))) / totalExpenses * 100 ≈ 100`

### P5: Budget Warning Thresholds
- `expenses / budget >= 1.0` → status must be `'exceeded'`
- `expenses / budget >= 0.8` → status must be `'warn'`
- `expenses / budget < 0.8` → status must be `'ok'`

### P6: Monthly Grouping Completeness
Every transaction must appear in exactly one month bucket in `groupByMonth()`. No transactions lost or duplicated.

---

## Accessibility Design

- All form fields use explicit `<label for="...">` associations
- Error messages use `id` referenced by `aria-describedby` on the input
- Summary cards region has `aria-live="polite"` so updates are announced
- Transaction list container has `role="list"` with `role="listitem"` rows
- Delete confirmation uses native `window.confirm` (screen-reader friendly)
- Color is never the sole means of conveying information (icons + text used alongside color)
- Focus is programmatically moved to the form when "Edit" is clicked

---

## MCP Configuration (Optional)

No MCP server is currently configured. To add a documentation MCP server:

1. Create `.kiro/settings/mcp.json`
2. Add a server entry pointing to a filesystem or documentation MCP server
3. This is optional and not required for the application to function

Example setup for a local filesystem MCP:
```json
{
  "mcpServers": {
    "docs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
    }
  }
}
```
