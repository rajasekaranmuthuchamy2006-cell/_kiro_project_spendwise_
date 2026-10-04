'use strict';

/* ============================================================
   SpendWise – script.js
   Sections:
     1. Constants & Configuration
     2. Application State
     3. localStorage Helpers
     4. Data Layer (CRUD)
     5. Calculation Functions
     6. Render Functions
     7. Event Handlers
     8. Initialization
   ============================================================ */

/* ---- 1. Constants & Configuration ---- */

const STORAGE_KEY    = 'spendwise_transactions';
const BUDGET_PREFIX  = 'budget_';
const BUDGET_WARN    = 0.8;   // 80% threshold
const BUDGET_EXCEED  = 1.0;   // 100% threshold

const CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'],
  expense: ['Food', 'Transport', 'Housing', 'Healthcare', 'Entertainment',
            'Shopping', 'Education', 'Utilities', 'Other Expense']
};

const CATEGORY_ICONS = {
  Salary: '💼', Freelance: '💻', Investment: '📈', Gift: '🎁', 'Other Income': '💰',
  Food: '🍔', Transport: '🚗', Housing: '🏠', Healthcare: '💊', Entertainment: '🎬',
  Shopping: '🛍️', Education: '📚', Utilities: '⚡', 'Other Expense': '📦'
};

const CURRENCY_FMT = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 2
});

/* ---- 2. Application State ---- */

let state = {
  transactions: [],
  editingId:    null,
  filters: { search: '', type: 'all', category: 'all' },
  currentMonth: ''
};

/* ---- 3. localStorage Helpers ---- */

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (_) { /* storage full or unavailable — fail silently */ }
}

function loadBudget(monthKey) {
  try {
    const raw = localStorage.getItem(BUDGET_PREFIX + monthKey);
    if (raw === null) return null;
    const val = parseFloat(raw);
    return isNaN(val) ? null : val;
  } catch (_) {
    return null;
  }
}

function saveBudget(monthKey, amount) {
  try {
    localStorage.setItem(BUDGET_PREFIX + monthKey, String(amount));
  } catch (_) { /* fail silently */ }
}

/* ---- 4. Data Layer ---- */

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function addTransaction(data) {
  const tx = {
    id:          generateId(),
    type:        data.type,
    amount:      parseFloat(data.amount),
    category:    sanitize(data.category),
    date:        data.date,
    description: sanitize(data.description || '')
  };
  state.transactions.push(tx);
  saveTransactions(state.transactions);
  return tx;
}

function updateTransaction(id, data) {
  const idx = state.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  state.transactions[idx] = {
    ...state.transactions[idx],
    type:        data.type,
    amount:      parseFloat(data.amount),
    category:    sanitize(data.category),
    date:        data.date,
    description: sanitize(data.description || '')
  };
  saveTransactions(state.transactions);
  return state.transactions[idx];
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveTransactions(state.transactions);
}

function getFilteredTransactions() {
  const { search, type, category } = state.filters;
  return state.transactions.filter(tx => {
    const matchSearch   = !search || tx.description.toLowerCase().includes(search.toLowerCase());
    const matchType     = type === 'all' || tx.type === type;
    const matchCategory = category === 'all' || tx.category === category;
    return matchSearch && matchType && matchCategory;
  });
}

/* Sanitize: strip HTML tags, store as plain text; escaping happens at render time */
function sanitize(str) {
  return String(str).replace(/<[^>]*>/g, '').trim();
}

/* ---- 5. Calculation Functions ---- */

function calcTotals(transactions) {
  let income = 0, expenses = 0;
  for (const tx of transactions) {
    if (tx.type === 'income')  income   += tx.amount;
    if (tx.type === 'expense') expenses += tx.amount;
  }
  return { income, expenses, balance: income - expenses };
}

function calcMonthlyTotals(transactions, monthKey) {
  let income = 0, expenses = 0;
  for (const tx of transactions) {
    if (tx.date && tx.date.startsWith(monthKey)) {
      if (tx.type === 'income')  income   += tx.amount;
      if (tx.type === 'expense') expenses += tx.amount;
    }
  }
  return { income, expenses };
}

function calcCategoryBreakdown(transactions, monthKey) {
  const result = {};
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date && tx.date.startsWith(monthKey)) {
      result[tx.category] = (result[tx.category] || 0) + tx.amount;
    }
  }
  return result;
}

function calcBudgetStatus(expenses, budget) {
  if (!budget || budget <= 0) return { percent: 0, status: 'ok' };
  const percent = expenses / budget;
  let status = 'ok';
  if (percent >= BUDGET_EXCEED) status = 'exceeded';
  else if (percent >= BUDGET_WARN) status = 'warn';
  return { percent: Math.min(percent, 1), status };
}

function groupByMonth(transactions) {
  const groups = {};
  for (const tx of transactions) {
    if (!tx.date) continue;
    const monthKey = tx.date.slice(0, 7); // "YYYY-MM"
    if (!groups[monthKey]) groups[monthKey] = { income: 0, expenses: 0 };
    if (tx.type === 'income')  groups[monthKey].income   += tx.amount;
    if (tx.type === 'expense') groups[monthKey].expenses += tx.amount;
  }
  return groups;
}

function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatMonthLabel(monthKey) {
  const [y, m] = monthKey.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/* ---- 6. Render Functions ---- */

function renderSummaryCards() {
  const { income, expenses, balance } = calcTotals(state.transactions);
  document.getElementById('total-income').textContent   = CURRENCY_FMT.format(income);
  document.getElementById('total-expenses').textContent = CURRENCY_FMT.format(expenses);
  document.getElementById('total-balance').textContent  = CURRENCY_FMT.format(balance);

  // Announce to screen readers
  const ann = document.getElementById('summary-announcement');
  if (ann) ann.textContent =
    `Summary updated: Income ${CURRENCY_FMT.format(income)}, ` +
    `Expenses ${CURRENCY_FMT.format(expenses)}, ` +
    `Balance ${CURRENCY_FMT.format(balance)}`;
}

function renderTransactionList() {
  const container = document.getElementById('transaction-list');
  const filtered  = getFilteredTransactions();

  // Sort descending by date then by insertion order
  const sorted = [...filtered].sort((a, b) => {
    if (b.date < a.date) return -1;
    if (b.date > a.date) return 1;
    return 0;
  });

  if (state.transactions.length === 0) {
    container.innerHTML = emptyStateHTML('📭', 'No transactions yet', 'Add your first transaction using the "Add Transaction" tab.');
    return;
  }

  if (sorted.length === 0) {
    container.innerHTML = emptyStateHTML('🔍', 'No matches found', 'Try adjusting your search or filter criteria.');
    return;
  }

  container.innerHTML = sorted.map(tx => {
    const icon = CATEGORY_ICONS[tx.category] || (tx.type === 'income' ? '💰' : '💸');
    const amountStr = (tx.type === 'income' ? '+' : '-') + CURRENCY_FMT.format(tx.amount);
    const dateStr   = formatDate(tx.date);
    const desc      = escapeHtml(tx.description) || '<em style="opacity:.6">No description</em>';

    return `
    <div class="transaction-item" role="listitem" data-id="${escapeAttr(tx.id)}">
      <div class="tx-icon ${tx.type}" aria-hidden="true">${icon}</div>
      <div class="tx-info">
        <div class="tx-description">${desc}</div>
        <div class="tx-meta">
          <span>${dateStr}</span>
          <span class="tx-badge ${tx.type}">${tx.type}</span>
          <span>${escapeHtml(tx.category)}</span>
        </div>
      </div>
      <div class="tx-amount ${tx.type}" aria-label="${tx.type} ${CURRENCY_FMT.format(tx.amount)}">${amountStr}</div>
      <div class="tx-actions">
        <button
          type="button"
          class="btn btn-edit btn-icon"
          data-action="edit"
          data-id="${escapeAttr(tx.id)}"
          aria-label="Edit transaction: ${escapeAttr(tx.description || tx.category)}"
          title="Edit"
        >✏️</button>
        <button
          type="button"
          class="btn btn-danger btn-icon"
          data-action="delete"
          data-id="${escapeAttr(tx.id)}"
          aria-label="Delete transaction: ${escapeAttr(tx.description || tx.category)}"
          title="Delete"
        >🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function renderBudgetSection() {
  const budget   = loadBudget(state.currentMonth);
  const display  = document.getElementById('budget-display');
  const monthLbl = document.getElementById('budget-month-label');

  if (monthLbl) monthLbl.textContent = formatMonthLabel(state.currentMonth);

  // Pre-fill input with stored budget
  const budgetInput = document.getElementById('budget-input');
  if (budgetInput && budget !== null) budgetInput.value = budget.toFixed(2);

  if (budget === null || budget <= 0) {
    display.innerHTML = '<p class="budget-no-data">No budget set for this month. Set one above to track your spending.</p>';
    return;
  }

  const { expenses } = calcMonthlyTotals(state.transactions, state.currentMonth);
  const { percent, status } = calcBudgetStatus(expenses, budget);
  const pct = Math.round(percent * 100);

  const statusMessages = {
    ok:       `✅ You're within budget. Keep it up!`,
    warn:     `⚠️ Heads up — you've used ${pct}% of your budget.`,
    exceeded: `🚨 Budget exceeded! You've spent ${CURRENCY_FMT.format(expenses)} of a ${CURRENCY_FMT.format(budget)} budget.`
  };

  display.innerHTML = `
    <div class="budget-stats">
      <span class="budget-stat">Budget: <strong>${CURRENCY_FMT.format(budget)}</strong></span>
      <span class="budget-stat">Spent: <strong>${CURRENCY_FMT.format(expenses)}</strong></span>
      <span class="budget-stat">Remaining: <strong>${CURRENCY_FMT.format(Math.max(0, budget - expenses))}</strong></span>
    </div>
    <div class="progress-container">
      <div class="progress-label">
        <span>Spending</span>
        <span>${pct}%</span>
      </div>
      <div class="progress-bar-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Budget used">
        <div class="progress-bar-fill ${status}" style="width:${pct}%"></div>
      </div>
    </div>
    <div class="budget-status ${status}" role="status">${statusMessages[status]}</div>
  `;
}

function renderCategoryChart() {
  const container = document.getElementById('category-chart');
  const monthLbl  = document.getElementById('chart-month-label');
  if (monthLbl) monthLbl.textContent = formatMonthLabel(state.currentMonth);

  const breakdown = calcCategoryBreakdown(state.transactions, state.currentMonth);
  const entries   = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const total     = entries.reduce((sum, [, v]) => sum + v, 0);

  if (entries.length === 0) {
    container.innerHTML = emptyStateHTML('🍩', 'No expense data', 'Add expense transactions for this month to see your spending breakdown.');
    return;
  }

  container.innerHTML = entries.map(([cat, amount]) => {
    const pct   = total > 0 ? Math.round((amount / total) * 100) : 0;
    const icon  = CATEGORY_ICONS[cat] || '📦';
    return `
    <div class="chart-row">
      <div class="chart-label-row">
        <span class="chart-category">${icon} ${escapeHtml(cat)}</span>
        <span class="chart-amount">${CURRENCY_FMT.format(amount)}</span>
      </div>
      <div class="chart-bar-track" role="presentation">
        <div class="chart-bar-fill" style="width:${pct}%" aria-hidden="true"></div>
      </div>
      <div class="chart-pct">${pct}% of expenses</div>
    </div>`;
  }).join('');
}

function renderMonthlySummary() {
  const container = document.getElementById('monthly-summary');
  const groups    = groupByMonth(state.transactions);
  const keys      = Object.keys(groups).sort().reverse(); // newest first

  if (keys.length === 0) {
    container.innerHTML = emptyStateHTML('📅', 'No data yet', 'Monthly summary will appear here once you add transactions.');
    return;
  }

  const rows = keys.map(key => {
    const { income, expenses } = groups[key];
    const net = income - expenses;
    const netClass = net >= 0 ? 'col-income' : 'col-expense';
    return `
    <tr>
      <td class="col-month">${formatMonthLabel(key)}</td>
      <td class="col-income">${CURRENCY_FMT.format(income)}</td>
      <td class="col-expense">${CURRENCY_FMT.format(expenses)}</td>
      <td class="${netClass}">${net >= 0 ? '+' : ''}${CURRENCY_FMT.format(net)}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <table class="monthly-table" aria-label="Monthly income and expense summary">
      <thead>
        <tr>
          <th scope="col">Month</th>
          <th scope="col">Income</th>
          <th scope="col">Expenses</th>
          <th scope="col">Net</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderAll() {
  renderSummaryCards();
  renderTransactionList();
  renderBudgetSection();
  renderCategoryChart();
  renderMonthlySummary();
}

/* ---- Utility DOM helpers ---- */

function emptyStateHTML(icon, title, text) {
  return `
    <div class="empty-state" role="status">
      <div class="empty-icon">${icon}</div>
      <p class="empty-title">${escapeHtml(title)}</p>
      <p class="empty-text">${escapeHtml(text)}</p>
    </div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ---- 7. Event Handlers ---- */

/* -- Form population helpers -- */

function populateCategoryDropdown(type, selectedValue) {
  const select = document.getElementById('category');
  if (!select) return;
  select.innerHTML = '';

  if (!type || !CATEGORIES[type]) {
    select.innerHTML = '<option value="">Select type first…</option>';
    return;
  }

  CATEGORIES[type].forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selectedValue) opt.selected = true;
    select.appendChild(opt);
  });
}

function updateFilterCategoryDropdown() {
  const select = document.getElementById('filter-category');
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="all">All Categories</option>';
  const allCats = [...new Set(state.transactions.map(t => t.category))].sort();
  allCats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === current) opt.selected = true;
    select.appendChild(opt);
  });
}

/* -- Form validation -- */

function validateForm() {
  let valid = true;

  const amount   = document.getElementById('amount');
  const type     = document.getElementById('type');
  const category = document.getElementById('category');
  const date     = document.getElementById('date');

  clearErrors();

  if (!amount.value || parseFloat(amount.value) <= 0) {
    showError('amount', 'Please enter a valid amount greater than zero.');
    valid = false;
  }

  if (!type.value) {
    showError('type', 'Please select a transaction type.');
    valid = false;
  }

  if (!category.value) {
    showError('category', 'Please select a category.');
    valid = false;
  }

  if (!date.value) {
    showError('date', 'Please select a date.');
    valid = false;
  }

  return valid;
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + '-error');
  const inputEl = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) inputEl.classList.add('error');
}

function clearErrors() {
  ['amount', 'type', 'category', 'date'].forEach(id => {
    const errEl = document.getElementById(id + '-error');
    const inpEl = document.getElementById(id);
    if (errEl) errEl.textContent = '';
    if (inpEl) inpEl.classList.remove('error');
  });
}

function resetForm() {
  const form = document.getElementById('transaction-form');
  if (form) form.reset();
  document.getElementById('edit-id').value = '';
  state.editingId = null;

  // Reset submit button and cancel button
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const formTitle = document.getElementById('form-title');
  if (submitBtn) submitBtn.textContent = 'Add Transaction';
  if (cancelBtn) cancelBtn.style.display = 'none';
  if (formTitle) formTitle.innerHTML = '<span aria-hidden="true">➕</span> Add Transaction';

  populateCategoryDropdown('expense');
  clearErrors();
}

function loadTransactionIntoForm(tx) {
  state.editingId = tx.id;
  document.getElementById('edit-id').value  = tx.id;
  document.getElementById('amount').value   = tx.amount.toFixed(2);
  document.getElementById('type').value     = tx.type;
  document.getElementById('date').value     = tx.date;
  document.getElementById('description').value = tx.description;

  populateCategoryDropdown(tx.type, tx.category);

  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const formTitle = document.getElementById('form-title');
  if (submitBtn) submitBtn.textContent = 'Update Transaction';
  if (cancelBtn) cancelBtn.style.display = '';
  if (formTitle) formTitle.innerHTML = '<span aria-hidden="true">✏️</span> Edit Transaction';

  // Switch to the add-transaction tab and focus amount
  switchTab('add-transaction');
  document.getElementById('amount').focus();
}

/* -- Tab switching -- */

function switchTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.removeAttribute('aria-current');
  });

  const panel = document.getElementById('tab-' + tabName);
  const btn   = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
  if (panel) panel.classList.remove('hidden');
  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-current', 'page'); }
}

/* ---- 8. Attach Event Listeners ---- */

function attachEventListeners() {

  /* Nav tabs */
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* Type select → update category dropdown */
  const typeSelect = document.getElementById('type');
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      populateCategoryDropdown(typeSelect.value);
    });
  }

  /* Transaction form submit */
  const form = document.getElementById('transaction-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm()) return;

      const data = {
        amount:      document.getElementById('amount').value,
        type:        document.getElementById('type').value,
        category:    document.getElementById('category').value,
        date:        document.getElementById('date').value,
        description: document.getElementById('description').value
      };

      if (state.editingId) {
        updateTransaction(state.editingId, data);
      } else {
        addTransaction(data);
      }

      resetForm();
      updateFilterCategoryDropdown();
      renderAll();
      switchTab('dashboard');
    });
  }

  /* Cancel edit button */
  const cancelBtn = document.getElementById('cancel-edit-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      resetForm();
      switchTab('dashboard');
    });
  }

  /* Transaction list — edit and delete via event delegation */
  const txList = document.getElementById('transaction-list');
  if (txList) {
    txList.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;

      if (action === 'edit') {
        const tx = state.transactions.find(t => t.id === id);
        if (tx) loadTransactionIntoForm(tx);
      }

      if (action === 'delete') {
        const tx = state.transactions.find(t => t.id === id);
        const label = tx ? (tx.description || tx.category) : 'this transaction';
        const confirmed = window.confirm(`Delete "${label}"?\n\nThis action cannot be undone.`);
        if (confirmed) {
          deleteTransaction(id);
          updateFilterCategoryDropdown();
          renderAll();
        }
      }
    });
  }

  /* Search input — real-time filter */
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.filters.search = searchInput.value.trim();
      renderTransactionList();
    });
  }

  /* Type filter */
  const filterType = document.getElementById('filter-type');
  if (filterType) {
    filterType.addEventListener('change', () => {
      state.filters.type = filterType.value;
      renderTransactionList();
    });
  }

  /* Category filter */
  const filterCategory = document.getElementById('filter-category');
  if (filterCategory) {
    filterCategory.addEventListener('change', () => {
      state.filters.category = filterCategory.value;
      renderTransactionList();
    });
  }

  /* Budget save */
  const saveBudgetBtn = document.getElementById('save-budget-btn');
  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener('click', () => {
      const input  = document.getElementById('budget-input');
      const amount = parseFloat(input.value);
      if (isNaN(amount) || amount < 0) {
        input.focus();
        input.classList.add('error');
        return;
      }
      input.classList.remove('error');
      saveBudget(state.currentMonth, amount);
      renderBudgetSection();
    });
  }

  /* Budget input — allow Enter key */
  const budgetInput = document.getElementById('budget-input');
  if (budgetInput) {
    budgetInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('save-budget-btn').click();
      }
    });
  }
}

/* ---- Initialization ---- */

document.addEventListener('DOMContentLoaded', () => {
  state.transactions = loadTransactions();
  state.currentMonth = getCurrentMonthKey();

  // Set today's date as default for the form date field
  const dateField = document.getElementById('date');
  if (dateField) {
    const now = new Date();
    const y   = now.getFullYear();
    const m   = String(now.getMonth() + 1).padStart(2, '0');
    const d   = String(now.getDate()).padStart(2, '0');
    dateField.value = `${y}-${m}-${d}`;
  }

  // Initial dropdown population
  populateCategoryDropdown('expense');
  updateFilterCategoryDropdown();

  // Render everything
  renderAll();

  // Attach all event listeners
  attachEventListeners();
});
