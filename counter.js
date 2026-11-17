const COUNTER_START = new Date("2026-11-16T00:00:00Z").getTime();

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(n) { return new Intl.NumberFormat("en-US").format(n); }

function renderCounters() {
  const el = document.getElementById("live-counters");
  if (!el) return;
  const ms = Math.max(0, Date.now() - COUNTER_START);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const visitors = Math.floor(ms / 5000);
  const partners = Math.floor(ms / 120000);
  el.innerHTML = `
    <div class="counter-card"><span class="counter-val">${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s</span><span class="counter-lbl">Hours of Operation</span></div>
    <div class="counter-card"><span class="counter-val">${fmt(visitors)}</span><span class="counter-lbl">Visitors</span></div>
    <div class="counter-card"><span class="counter-val">${fmt(partners)}</span><span class="counter-lbl">Partners</span></div>
    <div class="counter-note">Counters are illustrative (time-based, no visitor tracking).</div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderCounters();
  setInterval(renderCounters, 1000);
});
