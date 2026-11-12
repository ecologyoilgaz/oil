let OBJECTS = {};
let filtered = [];
let currentPage = 1;
const PER_PAGE = 12;

async function loadData() {
  try {
    const res = await fetch('objects.json');
    const data = await res.json();
    OBJECTS = data.objects || data;
    filtered = Object.entries(OBJECTS).map(([id, o]) => ({ id, ...o }));
    renderStats();
    renderCards();
  } catch (e) {
    console.error('Failed to load objects.json', e);
    document.getElementById('cards').innerHTML = '<p>Error loading data. Check objects.json format.</p>';
  }
}

function renderStats() {
  const el = document.getElementById('stats');
  if (!el) return;
  const total = filtered.length;
  const red = filtered.filter(o => o.status === 'red').length;
  const green = filtered.filter(o => o.status === 'green').length;
  const totalLoss = filtered.reduce((sum, o) => sum + (o.financial_impact?.loss_usd || 0), 0);
  const totalLossFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalLoss);

  el.innerHTML = `
    <div class="stat"><span class="num">${total}</span><span class="label">Objects</span></div>
    <div class="stat"><span class="num" style="color:var(--red)">${red}</span><span class="label">Gaps (🔴)</span></div>
    <div class="stat"><span class="num" style="color:var(--red); font-size: 22px;">${totalLossFormatted}</span><span class="label">Estimated Loss (USD)</span></div>
    <div class="stat"><span class="num" style="color:var(--green)">${green}</span><span class="label">Verified (🟢)</span></div>
  `;
}

function renderCards() {
  const el = document.getElementById('cards');
  if (!el) return;
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);
  el.innerHTML = pageItems.map(o => {
    let priceHtml = '';
    if (o.financial_impact?.loss_usd) {
      const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(o.financial_impact.loss_usd);
      priceHtml = `<div class="card-meta" style="color:var(--red); font-weight:bold; margin-top:6px;">Loss: ${usd}</div>`;
    }
    return `
      <a href="object.html?id=${o.id}" class="card ${o.status}">
        <div class="card-title">${o.title}</div>
        <div class="card-meta"><strong>Claimed:</strong> ${o.claimed}</div>
        <div class="card-meta"><strong>Actual:</strong> ${o.actual}</div>
        ${priceHtml}
        <div class="card-country">${o.country} · ${o.region}</div>
      </a>
    `;
  }).join('');
  renderPagination();
}

function renderPagination() {
  const el = document.getElementById('pagination');
  if (!el) return;
  const pages = Math.ceil(filtered.length / PER_PAGE);
  let html = '';
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  el.innerHTML = html;
}

function goPage(p) { currentPage = p; renderCards(); window.scrollTo({top: 0, behavior: 'smooth'}); }

function applyFilters() {
  const status = document.getElementById('filter-status')?.value || '';
  const region = document.getElementById('filter-region')?.value || '';
  const search = (document.getElementById('filter-search')?.value || '').toLowerCase();
  filtered = Object.entries(OBJECTS).map(([id, o]) => ({ id, ...o })).filter(o => {
    if (status && o.status !== status) return false;
    if (region && o.region !== region) return false;
    if (search && !(`${o.title} ${o.country} ${(o.companies||[]).join(' ')}`).toLowerCase().includes(search)) return false;
    return true;
  });
  currentPage = 1;
  renderStats();
  renderCards();
}

function renderMap() {
  if (typeof L === 'undefined' || !document.getElementById('map')) return;
  const map = L.map('map').setView([25, 15], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'© OpenStreetMap'}).addTo(map);
  Object.entries(OBJECTS).forEach(([id, o]) => {
    const color = o.status === 'red' ? '#FF4D4D' : o.status === 'green' ? '#4DFF88' : '#8A94C8';
    L.circleMarker([o.lat, o.lon], {radius: 7, color, fillOpacity: .7})
      .addTo(map)
      .bindPopup(`<b>${o.title}</b><br>${o.country}<br><a href="object.html?id=${id}">Details</a>`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  ['filter-status','filter-region','filter-search'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', applyFilters);
  });
});
