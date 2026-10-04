# Requirements Document

## Introduction

SpendWise is a responsive, client-side personal expense tracker built with HTML, CSS, and vanilla JavaScript. It enables users to record income and expense transactions, categorize them, set monthly budgets, visualize spending, and manage their full transaction history — all stored locally in the browser with no backend dependency.

## Glossary

- **App**: The SpendWise single-page web application
- **Transaction**: A single financial record with amount, type (income or expense), category, date, and description
- **Balance**: Total income minus total expenses across all stored transactions
- **Budget**: A user-defined monthly spending limit stored per calendar month
- **Category**: A predefined classification label for a transaction (e.g. Food, Transport, Salary)
- **Dashboard**: The main view showing summary cards, transaction form, history, and charts
- **Storage**: The browser's localStorage used for data persistence
- **Filter**: A combination of search text, type, and/or category criteria applied to the transaction list
- **Validator**: The input validation logic within script.js
- **Renderer**: The DOM update logic within script.js

---

## Requirements

### Requirement 1: Summary Dashboard Cards

**User Story:** As a user, I want to see my total income, total expenses, and available balance at a glance, so that I can quickly understand my financial position.

#### Acceptance Criteria

1. THE App SHALL display three summary cards: Total Income, Total Expenses, and Available Balance.
2. WHEN a transaction is added, edited, or deleted, THE Renderer SHALL recalculate and update all three summary card values immediately.
3. THE App SHALL calculate Available Balance as Total Income minus Total Expenses.
4. THE App SHALL format all monetary values using the browser's `Intl.NumberFormat` with currency style (USD).
5. WHEN no transactions exist, THE App SHALL display zero values in all summary cards.

---

### Requirement 2: Transaction Entry Form

**User Story:** As a user, I want to add transactions with amount, type, category, date, and description, so that I can keep an accurate record of my finances.

#### Acceptance Criteria

1. THE App SHALL provide a form with the following fields: Amount (number), Type (income/expense selector), Category (dropdown), Date (date input), and Description (text input).
2. THE App SHALL populate the Category dropdown with options relevant to the selected Type (income categories vs. expense categories).
3. WHEN the Type field changes, THE App SHALL update the Category dropdown options without requiring a page reload.
4. THE Validator SHALL require Amount, Type, Category, and Date fields before allowing form submission.
5. IF the Amount field contains a value less than or equal to zero, THEN THE Validator SHALL display an error message associated with the Amount field.
6. IF a required field is empty on submission, THEN THE Validator SHALL display a field-level error message associated with that field via `aria-describedby`.
7. WHEN the form is submitted with valid data, THE App SHALL add the transaction to Storage and reset the form to its default state.
8. WHEN editing an existing transaction, THE App SHALL pre-populate the form with the transaction's current values and display a "Update Transaction" submit label.
9. WHEN editing an existing transaction, THE App SHALL update the stored record in Storage on submission without creating a duplicate.

---

### Requirement 3: Transaction History

**User Story:** As a user, I want to view, search, filter, edit, and delete my transactions, so that I can manage and review my financial records.

#### Acceptance Criteria

1. THE App SHALL display all stored transactions in reverse-chronological order by date.
2. THE App SHALL display each transaction row with: date, description, category, type badge, and formatted amount.
3. THE App SHALL provide a search input that filters the displayed transactions by description text in real time.
4. THE App SHALL provide a Type filter (All / Income / Expense) that limits displayed transactions to the selected type.
5. THE App SHALL provide a Category filter dropdown that limits displayed transactions to the selected category.
6. WHEN multiple filters are active simultaneously, THE App SHALL apply all filters as a conjunction (AND logic).
7. WHEN no transactions match the active filters, THE App SHALL display an empty state message.
8. WHEN no transactions exist at all, THE App SHALL display a distinct empty state prompt encouraging the user to add a transaction.
9. THE App SHALL provide an Edit button per transaction row that loads the transaction into the form for editing.
10. THE App SHALL provide a Delete button per transaction row.
11. WHEN the Delete button is clicked, THE App SHALL display a confirmation dialog before removing the transaction from Storage.
12. WHEN a transaction is deleted, THE App SHALL remove it from Storage and refresh the transaction list and summary cards.

---

### Requirement 4: Monthly Budget Management

**User Story:** As a user, I want to set a monthly spending budget and receive warnings when I approach or exceed it, so that I can control my expenses.

#### Acceptance Criteria

1. THE App SHALL provide a budget input allowing the user to set a monthly spending limit for the currently selected month.
2. THE App SHALL store the monthly budget in Storage keyed by year-month (e.g. "2025-07").
3. WHEN the user saves a budget, THE App SHALL persist it to Storage and update the budget display immediately.
4. THE App SHALL calculate current month's total expenses from all transactions whose date falls within the current calendar month.
5. WHEN current month expenses reach 80% or more of the budget, THE App SHALL display a warning message indicating spending is approaching the limit.
6. WHEN current month expenses equal or exceed 100% of the budget, THE App SHALL display an alert message indicating the budget has been exceeded.
7. WHEN no budget is set for the current month, THE App SHALL display a prompt inviting the user to set a budget.
8. THE App SHALL display a progress bar showing the percentage of the monthly budget consumed.

---

### Requirement 5: Category-Wise Expense Visualization

**User Story:** As a user, I want to see a visual breakdown of my spending by category, so that I can identify where my money goes.

#### Acceptance Criteria

1. THE App SHALL display a category breakdown section showing each expense category's total amount for the currently viewed month.
2. THE App SHALL render each category as a labeled bar with a percentage of total monthly expenses shown.
3. WHEN no expense transactions exist for the selected month, THE App SHALL display an empty state for the chart section.
4. THE App SHALL use CSS-only bar rendering (no canvas, no SVG charts, no external chart libraries).
5. WHEN a transaction is added, edited, or deleted, THE Renderer SHALL refresh the category breakdown immediately.

---

### Requirement 6: Monthly Spending Summary

**User Story:** As a user, I want to review income and expense totals by month, so that I can track my financial trends over time.

#### Acceptance Criteria

1. THE App SHALL display a monthly summary table or list showing each month (that has transactions) with its total income and total expenses.
2. THE App SHALL sort the monthly summary in reverse-chronological order (most recent month first).
3. WHEN a new transaction is added for a month not yet in the summary, THE Renderer SHALL add that month to the summary list.
4. WHEN all transactions for a given month are deleted, THE Renderer SHALL remove that month from the summary list.

---

### Requirement 7: Data Persistence

**User Story:** As a user, I want my transactions and budget settings to survive browser refreshes, so that I don't lose my financial data.

#### Acceptance Criteria

1. THE App SHALL save all transactions to Storage under a single key as a JSON-serialized array.
2. THE App SHALL save budget values to Storage under a namespaced key per year-month.
3. WHEN the App initializes, THE App SHALL load all transactions and budgets from Storage and render the Dashboard.
4. IF Storage read fails or returns corrupt data, THEN THE App SHALL initialize with an empty state without throwing an uncaught error.
5. THE App SHALL write to Storage after every transaction add, edit, or delete operation.

---

### Requirement 8: Accessibility and Responsive Design

**User Story:** As a user, I want to use the app on any device and with assistive technologies, so that it is inclusive and works everywhere.

#### Acceptance Criteria

1. THE App SHALL use a responsive layout that adapts to viewport widths from 320px to 1440px.
2. THE App SHALL provide visible focus indicators for all interactive elements.
3. THE App SHALL associate all form labels with their controls using explicit `for`/`id` pairing.
4. WHEN a dynamic content region updates (summary cards, transaction list), THE App SHALL use `aria-live` regions so screen readers announce the change.
5. THE App SHALL achieve a minimum WCAG AA color contrast ratio of 4.5:1 for all body text against its background.
6. THE App SHALL be fully operable using keyboard navigation alone (Tab, Shift+Tab, Enter, Space, Escape).
7. WHERE touch devices are used, THE App SHALL provide touch targets of at least 44×44 CSS pixels for all interactive controls.
