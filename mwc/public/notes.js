  // ─── NOTES MANAGEMENT ────────────────────────────────────────────────────────

// Open modal to add or edit a note
function openNoteModal(noteId = null, sessionId = null) {
  const modal = document.getElementById('modal-note');
  const titleEl = document.getElementById('note-modal-title');
  const idInput = document.getElementById('note-id');
  const sessionInput = document.getElementById('note-session-id');
  const subjectInput = document.getElementById('note-subject');
  const dateInput = document.getElementById('note-date');
  const contentInput = document.getElementById('note-content');

  // Populate subject select options
  if (subjectInput) {
    subjectInput.innerHTML = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }

  // Set default values
  idInput.value = noteId || '';
  sessionInput.value = sessionId || '';
  contentInput.value = '';

  const subjectGroup = document.getElementById('note-subject-group');
  const dateGroup = document.getElementById('note-date-group');

  if (noteId) {
    // EDITING EXISTED NOTE
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    contentInput.value = note.content;

    if (note.session_id) {
      // Session note: subject and date are locked
      sessionInput.value = note.session_id;
      titleEl.textContent = 'Edit Catatan Sesi';
      if (subjectGroup) subjectGroup.style.display = 'none';
      if (dateGroup) dateGroup.style.display = 'none';
    } else {
      // Independent note: subject and date are editable
      sessionInput.value = '';
      titleEl.textContent = 'Edit Catatan Mandiri';
      if (subjectGroup) subjectGroup.style.display = 'block';
      if (dateGroup) dateGroup.style.display = 'block';
      if (subjectInput) subjectInput.value = note.subject_id;
      if (dateInput) dateInput.value = note.date;
    }
  } else {
    // CREATING NEW NOTE
    if (sessionId) {
      // Add note linked to a session
      titleEl.textContent = 'Tambah Catatan Sesi';
      if (subjectGroup) subjectGroup.style.display = 'none';
      if (dateGroup) dateGroup.style.display = 'none';
    } else {
      // Add independent note
      titleEl.textContent = 'Tambah Catatan Mandiri';
      if (subjectGroup) subjectGroup.style.display = 'block';
      if (dateGroup) dateGroup.style.display = 'block';
      if (dateInput) dateInput.valueAsDate = new Date();
      if (subjectInput && subjects.length > 0) {
        // Default to the first subject
        subjectInput.selectedIndex = 0;
      }
    }
  }

  openModal('modal-note');
}

// Save a note via API (POST or PUT)
async function saveNote() {
  const id = document.getElementById('note-id').value;
  const sessionId = document.getElementById('note-session-id').value;
  const subjectId = document.getElementById('note-subject').value;
  const date = document.getElementById('note-date').value;
  const content = document.getElementById('note-content').value.trim();

  if (!content) {
    toast('Isi catatan materi wajib diisi');
    return;
  }

  const isIndependent = !sessionId;
  if (isIndependent) {
    if (!subjectId) {
      toast('Pilih mata kuliah terlebih dahulu');
      return;
    }
    if (!date) {
      toast('Pilih tanggal catatan');
      return;
    }
  }

  const payload = {
    content,
    session_id: sessionId ? parseInt(sessionId) : null,
    subject_id: isIndependent ? parseInt(subjectId) : null,
    date: isIndependent ? date : null
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API}/notes/${id}` : `${API}/notes`;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Gagal menyimpan catatan');
    }

    closeModal('modal-note');
    toast(id ? 'Catatan berhasil diperbarui' : 'Catatan berhasil ditambahkan');

    // Reload notes data
    await loadNotes();

    // Re-render active view
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      if (activePage.id === 'page-sessions') {
        renderSessionsTable();
      } else if (activePage.id === 'page-materi') {
        renderMateriPage();
      }
    }
  } catch (err) {
    toast(err.message);
  }
}

// Delete note for a session row
async function deleteNoteForSession(noteId) {
  if (!confirm('Hapus catatan materi untuk sesi ini?')) return;
  try {
    const res = await fetch(`${API}/notes/${noteId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Gagal menghapus catatan');
    toast('Catatan materi dihapus');
    await loadNotes();
    renderSessionsTable();
  } catch (err) {
    toast(err.message);
  }
}

// Delete note from the Materi review page list
async function deleteNoteFromMateri(noteId) {
  if (!confirm('Hapus catatan materi ini?')) return;
  try {
    const res = await fetch(`${API}/notes/${noteId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Gagal menghapus catatan');
    toast('Catatan materi dihapus');
    await loadNotes();
    renderMateriPage();
  } catch (err) {
    toast(err.message);
  }
}

// Triggered when dropdown changes on the Materi page
function filterMateriNotes() {
  renderMateriNotesList();
}

// Renders the Materi page layout
function renderMateriPage() {
  const select = document.getElementById('materi-subject-select');
  if (!select) return;

  // Preserve the selected subject ID if already chosen
  const prevVal = select.value;
  select.innerHTML = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  if (prevVal && subjects.some(s => s.id == prevVal)) {
    select.value = prevVal;
  } else if (subjects.length > 0) {
    select.value = subjects[0].id;
  }

  renderMateriNotesList();
}

// Renders the filtered notes list on the Materi page
function renderMateriNotesList() {
  const listContainer = document.getElementById('materi-list');
  const select = document.getElementById('materi-subject-select');
  if (!listContainer || !select) return;

  const subjectId = parseInt(select.value);
  if (!subjectId) {
    listContainer.innerHTML = `
      <div class="empty" style="padding:48px;">
        <div class="empty-icon">📖</div>
        <div class="empty-title">Belum ada mata kuliah</div>
        <div class="empty-desc">Silakan tambahkan mata kuliah terlebih dahulu.</div>
      </div>`;
    return;
  }

  const subject = subjects.find(s => s.id === subjectId);
  const subjectColor = subject ? subject.color : '#2563EB';

  // Filter notes belonging to the selected subject
  const filteredNotes = notes.filter(n => n.subject_id === subjectId);

  if (filteredNotes.length === 0) {
    listContainer.innerHTML = `
      <div class="empty" style="padding:48px;">
        <div class="empty-icon">📝</div>
        <div class="empty-title">Belum ada catatan</div>
        <div class="empty-desc">Tambahkan catatan sesi belajar atau buat catatan mandiri baru.</div>
      </div>`;
    return;
  }

  // Render cards in ascending order of date
  listContainer.innerHTML = filteredNotes.map(n => {
    // Generate origin label badge
    let badgeHtml = '';
    if (n.session_id) {
      const dur = n.session_date ? `Sesi ${formatDate(n.session_date)}` : 'Sesi Belajar';
      const desc = n.session_notes ? ` - ${n.session_notes}` : '';
      badgeHtml = `<span class="badge badge-sesi" style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">
        <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right:4px;vertical-align:middle;display:inline-block;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${dur}${desc}
      </span>`;
    } else {
      badgeHtml = `<span class="badge badge-mandiri" style="background:#f3e8ff;color:#6b21a8;border:1px solid #e9d5ff;">
        <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right:4px;vertical-align:middle;display:inline-block;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Belajar Mandiri
      </span>`;
    }

    // Replace newlines with break tags for multiline notes content
    const formattedContent = n.content.replace(/\n/g, '<br>');

    return `
      <div class="card note-card" style="border-left: 4px solid ${subjectColor}; padding: 20px; margin-bottom: 16px; position: relative;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <div style="font-size:0.8rem; font-weight:600; color:var(--muted); margin-bottom:4px;">
              ${formatDate(n.date)}
            </div>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              ${badgeHtml}
            </div>
          </div>
          <div class="actions">
            <button class="btn btn-ghost btn-sm btn-icon" title="Edit Catatan" onclick="openNoteModal(${n.id}, ${n.session_id})">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-danger btn-sm btn-icon" title="Hapus Catatan" onclick="deleteNoteFromMateri(${n.id})">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </div>
        <div class="note-card-content" style="font-size:0.9rem; color:var(--text); line-height:1.6; white-space: normal; word-break: break-word;">
          ${formattedContent}
        </div>
      </div>`;
  }).join('');
}
