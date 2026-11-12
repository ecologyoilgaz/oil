let OBJECTS = {};
let filtered = [];
let currentPage = 1;
const PER_PAGE = 12;

async function loadData() {
  const res = await fetch('objects.json');
  const data = await res.json();
  OBJECTS = data.objects || data;
  filtered = Object.entries(OBJECTS).map(([id, o]) => ({ id, ...o }));
  renderStats();
  renderCards();
}

function renderStats() {
  const total = filtered.length;
  const red = filtered.filter(o => o.status === 'red').length;
  const green = filtered.filter(o => o.status === 'green').length;
  const gray = filtered.filter(o => o.status === 'gray').length;
  const el = document.getElementById('stats');
  if (!el) return;
  el.innerHTML = `
    <div class="stat"><span class="num">${total}</span><span class="label">Objects</span></div>
    <div class="stat"><span class="num" style="color:var(--red)">${red}</span><span class="label">Gaps (🔴)</span></div>
    <div class="stat"><span class="num" style="color:var(--green)">${green}</span><span class="label">Verified (🟢)</span></div>
    <div class="stat"><span class="num" style="color:var(--muted)">${gray}</span><span class="label">Pending (⚫)</span></div>
  `;
}

function renderCards() {
  const el = document.getElementById('cards');
  if (!el) return;
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);
  el.innerHTML = pageItems.map(o => `
    <a href="object.html?id=${o.id}" class="card ${o.status}">
      <div class="card-title">${o.title}</div>
      <div class="card-meta"><strong>Claimed:</strong> ${o.claimed}</div>
      <div class="card-meta"><strong>Actual:</strong> ${o.actual}</div>
      <div class="card-country">${o.country} · ${o.region}</div>
    </a>
  `).join('');
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
