let OBJECTS = [];
let filtered = [];
let currentPage = 1;
const PER_PAGE = 12;

async function loadIndex() {
  const res = await fetch('objects/index.json');
  const index = await res.json();
  const promises = index.objects.map(id => fetch(`objects/${id}.json`).then(r => r.json()));
  OBJECTS = await Promise.all(promises);
  filtered = [...OBJECTS];
}

async function init() {
  await loadIndex();
  renderStats();
  renderCards();
  ['filter-status','filter-region','filter-search'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', applyFilters);
  });
}

function renderStats() {
  const el = document.getElementById('stats');
  if (!el) return;
  
  const total = filtered.length;
  const red = filtered.filter(o => o.status === 'red').length;
  const green = filtered.filter(o => o.status === 'green').length;
  
  // Считаем общую сумму ущерба в USD
  const totalLoss = filtered.reduce((sum, o) => sum + (o.financial_impact?.loss_usd || 0), 0);
  const totalLossFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalLoss);

  el.innerHTML = `
    <div class="stat"><span class="num">${total}</span><span class="label">Objects</span></div>
    <div class="stat"><span class="num" style="color:var(--red)">${red}</span><span class="label">Gaps (🔴)</span></div>
    <div class="stat"><span class="num" style="color:var(--red); font-size: 22px;">${totalLossFormatted}</span><span class="label">Estimated Loss (USD)</span></div>
    <div class="stat"><span class="num" style="color:var(--green)">${green}</span><span class="label">Verified (🟢)</span></div>
  `;
}
