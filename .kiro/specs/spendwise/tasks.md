# Tasks – SpendWise Smart Expense Tracker

## Task List

- [x] 1. Project scaffold and file structure
  - [x] 1.1 Create `index.html` with semantic HTML5 structure, all sections, and ARIA annotations
  - [x] 1.2 Create `style.css` with CSS variables design system and base styles
  - [x] 1.3 Create `script.js` with constants, state object, and localStorage helpers

- [x] 2. Core data layer (script.js)
  - [x] 2.1 Implement `addTransaction`, `updateTransaction`, `deleteTransaction` functions
  - [x] 2.2 Implement `calcTotals`, `calcMonthlyTotals`, `calcCategoryBreakdown`, `calcBudgetStatus`, `groupByMonth`
  - [x] 2.3 Implement `getFilteredTransactions` with search + type + category filter logic

- [x] 3. Transaction form (UI + validation)
  - [x] 3.1 Implement dynamic category dropdown population based on selected type
  - [x] 3.2 Implement client-side form validation with accessible error messages
  - [x] 3.3 Implement form submit handler (add mode and edit mode)
  - [x] 3.4 Implement form pre-population when editing an existing transaction

- [x] 4. Summary cards
  - [x] 4.1 Implement `renderSummaryCards` to display income, expenses, balance with Intl formatting
  - [x] 4.2 Wire summary card updates to all data mutation events

- [x] 5. Transaction history
  - [x] 5.1 Implement `renderTransactionList` with reverse-chronological order
  - [x] 5.2 Implement search input real-time filter
  - [x] 5.3 Implement type and category filter dropdowns
  - [x] 5.4 Implement Edit button handler (load into form, scroll to form)
  - [x] 5.5 Implement Delete button handler with confirmation dialog
  - [x] 5.6 Implement empty state messages (no data vs no filter results)

- [x] 6. Budget management
  - [x] 6.1 Implement budget input and save handler
  - [x] 6.2 Implement `renderBudgetSection` with progress bar and status messages (ok / warn / exceeded)
  - [x] 6.3 Wire budget re-render to all transaction data change events

- [x] 7. Category chart and monthly summary
  - [x] 7.1 Implement `renderCategoryChart` with CSS-only percentage bars
  - [x] 7.2 Implement `renderMonthlySummary` with grouped month totals table

- [x] 8. Responsive layout and design polish (style.css)
  - [x] 8.1 Implement mobile-first responsive grid layout
  - [x] 8.2 Apply fintech-inspired visual design (cards, badges, typography)
  - [x] 8.3 Implement accessible focus styles and color contrast compliance

- [x] 9. Kiro hooks
  - [x] 9.1 Create file validation hook (checks for index.html, style.css, script.js)
  - [x] 9.2 Create code review hook for accessibility and specification deviations

- [x] 10. Manual testing and verification
  - [x] 10.1 Test all CRUD operations and verify localStorage persistence
  - [x] 10.2 Test all filter combinations including conjunction logic
  - [x] 10.3 Test budget warning thresholds at 0%, 79%, 80%, 100%, and >100%
  - [x] 10.4 Test form validation (empty fields, negative amount, edit mode)
  - [x] 10.5 Test responsive layout at 320px, 768px, and 1024px viewport widths
  - [x] 10.6 Test data persistence by verifying state survives page reload
