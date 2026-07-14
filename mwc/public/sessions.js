function renderSessionsTable() {
  const tbody = document.getElementById('sessions-table');
  if (!tbody) return;
  if (sessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty" style="padding:40px"><div class="empty-icon">⏱️</div><div class="empty-title">Belum ada sesi</div><div class="empty-desc">Mulai catat sesi belajarmu.</div></div></td></tr>`;
    return;
  }
  tbody.innerHTML = sessions.map(s => {
    const note = notes.find(n => n.session_id === s.id);
    const noteContentHtml = note 
      ? `<div class="session-note-preview" style="font-size:.72rem;color:var(--muted);margin-top:4px;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;" title="${note.content}">
           <strong>Materi:</strong> ${note.content}
         </div>`
      : '';

    const noteActionHtml = note
      ? `<button class="btn btn-ghost btn-sm btn-icon" style="color: var(--accent); border-color: rgba(37,99,235,.2);" title="Edit Catatan" onclick="openNoteModal(${note.id}, ${s.id})">
           <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>
         </button>
         <button class="btn btn-danger btn-sm btn-icon" title="Hapus Catatan" onclick="deleteNoteForSession(${note.id})">
           <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
         </button>`
      : `<button class="btn btn-ghost btn-sm" onclick="openNoteModal(null, ${s.id})" style="border-style:dashed;padding:4px 8px;font-size:0.75rem;height:27px;">
           <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
           + Catatan
         </button>`;

    return `
      <tr>
        <td><span class="subject-pill" style="background:${hexToRgba(s.subject_color,.12)};color:${s.subject_color}">
          <span class="subject-dot" style="background:${s.subject_color}"></span>${s.subject_name}
        </span></td>
        <td style="color:var(--muted)">${formatDate(s.date)}</td>
        <td><span class="dur-badge">${formatDuration(s.duration_minutes)}</span></td>
        <td style="font-size:.85rem;max-width:240px;overflow:hidden;">
          <div style="color:var(--text);font-weight:500;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;">${s.notes || '—'}</div>
          ${noteContentHtml}
        </td>
        <td><div class="actions">
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit Sesi" onclick="openSessionModal(${s.id})">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-danger btn-sm btn-icon" title="Hapus Sesi" onclick="deleteSession(${s.id})">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
          <span style="border-left: 1px solid var(--border); margin: 0 4px;"></span>
          ${noteActionHtml}
        </div></td>
      </tr>`;
  }).join('');
}

function openSessionModal(id = null) {
  editSessionId = id;
  const modalTitle = document.getElementById('session-modal-title');
  if (modalTitle) {
    modalTitle.textContent = id ? 'Edit Sesi Belajar' : 'Catat Sesi Belajar';
  }
  const sel = document.getElementById('session-subject');
  if (!sel) return;
  sel.innerHTML = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  if (id) {
    const sess = sessions.find(x => x.id === id);
    sel.value = sess.subject_id;
    document.getElementById('session-date').value = sess.date;
    document.getElementById('session-duration').value = sess.duration_minutes;
    document.getElementById('session-notes').value = sess.notes;
  } else {
    document.getElementById('session-date').valueAsDate = new Date();
    document.getElementById('session-duration').value = '';
    document.getElementById('session-notes').value = '';
  }
  openModal('modal-session');
}

async function saveSession() {
  const subject_id = document.getElementById('session-subject').value;
  const date = document.getElementById('session-date').value;
  const duration_minutes = document.getElementById('session-duration').value;
  const notes = document.getElementById('session-notes').value;

  if (!subject_id) { toast('Pilih mata kuliah'); return; }
  if (!date) { toast('Pilih tanggal'); return; }
  if (!duration_minutes || duration_minutes < 1) { toast('Masukkan durasi yang valid'); return; }

  const method = editSessionId ? 'PUT' : 'POST';
  const url = editSessionId ? `${API}/sessions/${editSessionId}` : `${API}/sessions`;
  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject_id, date, duration_minutes, notes }) });

  closeModal('modal-session');
  await loadSessions();
  renderSessionsTable();
  if (typeof loadStats === 'function') loadStats();
  toast(editSessionId ? 'Sesi diperbarui' : 'Sesi ditambahkan');
}

async function deleteSession(id) {
  if (!confirm('Hapus sesi ini?')) return;
  await fetch(`${API}/sessions/${id}`, { method: 'DELETE' });
  await loadSessions();
  renderSessionsTable();
  if (typeof loadStats === 'function') loadStats();
  toast('Sesi dihapus');
}
