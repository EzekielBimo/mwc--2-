const API = 'http://localhost:3000/api';
let editSubjectId = null;
let editSessionId = null;
let subjects = [];
let sessions = [];
let notes = [];

// ── Init ────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const dashDateEl = document.getElementById('dash-date');
  if (dashDateEl) {
    dashDateEl.textContent = now.toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
  const sessionDateEl = document.getElementById('session-date');
  if (sessionDateEl) {
    sessionDateEl.valueAsDate = now;
  }
  loadAll();
});

async function loadAll() {
  await Promise.all([loadSubjects(), loadSessions(), loadNotes(), loadStats()]);
}

// ── Navigation ──────────────────────────────────────────────────────
function switchPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + name);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.querySelector(`[data-page="${name}"]`);
  if (navEl) navEl.classList.add('active');
  if (name === 'subjects' && typeof renderSubjects === 'function') renderSubjects();
  if (name === 'sessions' && typeof renderSessionsTable === 'function') renderSessionsTable();
  if (name === 'dashboard' && typeof loadStats === 'function') loadStats();
  if (name === 'materi' && typeof renderMateriPage === 'function') renderMateriPage();
}

// ── API calls ────────────────────────────────────────────────────────
async function loadSubjects() {
  const res = await fetch(`${API}/subjects`);
  subjects = await res.json();
  return subjects;
}
async function loadSessions() {
  const res = await fetch(`${API}/sessions`);
  sessions = await res.json();
  return sessions;
}
async function loadNotes() {
  const res = await fetch(`${API}/notes`);
  notes = await res.json();
  return notes;
}

// ── Helpers ──────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
}
function formatDuration(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}j ${m}m` : `${m} mnt`;
}
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}
