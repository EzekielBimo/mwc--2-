async function loadStats() {
  const res = await fetch(`${API}/stats`);
  const stats = await res.json();

  const totalMin = stats.reduce((s, i) => s + i.total_minutes, 0);
  const totalSess = stats.reduce((s, i) => s + i.total_sessions, 0);
  
  const hoursEl = document.getElementById('stat-hours');
  if (hoursEl) hoursEl.textContent = (totalMin / 60).toFixed(1);
  
  const sessionsEl = document.getElementById('stat-sessions');
  if (sessionsEl) sessionsEl.textContent = totalSess;
  
  const subjectsEl = document.getElementById('stat-subjects');
  if (subjectsEl) subjectsEl.textContent = stats.length;

  renderBarChart(stats);
  renderRecentSessions();
}

function renderBarChart(stats) {
  const el = document.getElementById('bar-chart');
  if (!el) return;
  const sorted = [...stats].sort((a, b) => b.total_minutes - a.total_minutes);
  if (sorted.length === 0 || sorted[0].total_minutes === 0) {
    el.innerHTML = '<div class="empty"><div class="empty-desc">Belum ada sesi belajar</div></div>';
    return;
  }
  const max = sorted[0].total_minutes;
  el.innerHTML = sorted.map(s => `
    <div class="bar-row">
      <div class="bar-label" title="${s.subject_name}">${s.subject_name}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(s.total_minutes/max*100).toFixed(1)}%;background:${s.subject_color}"></div>
      </div>
      <div class="bar-val">${(s.total_minutes/60).toFixed(1)} jam</div>
    </div>`).join('');
}

function renderRecentSessions() {
  const tbody = document.getElementById('recent-sessions');
  if (!tbody) return;
  const recent = [...sessions].slice(0, 6);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty" style="padding:32px"><div class="empty-icon">📚</div><div class="empty-title">Belum ada sesi</div><div class="empty-desc">Tambah sesi belajar pertamamu</div></div></td></tr>`;
    return;
  }
  tbody.innerHTML = recent.map(s => `
    <tr>
      <td><span class="subject-pill" style="background:${hexToRgba(s.subject_color,.12)};color:${s.subject_color}">
        <span class="subject-dot" style="background:${s.subject_color}"></span>${s.subject_name}
      </span></td>
      <td style="color:var(--muted)">${formatDate(s.date)}</td>
      <td><span class="dur-badge">${formatDuration(s.duration_minutes)}</span></td>
      <td style="color:var(--muted);font-size:.8rem">${s.notes || '—'}</td>
    </tr>`).join('');
}
