function renderSubjects() {
  const grid = document.getElementById('subjects-grid');
  if (!grid) return;
  if (subjects.length === 0) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;padding:52px"><div class="empty-icon">📖</div><div class="empty-title">Belum ada mata kuliah</div><div class="empty-desc">Tambah mata kuliah untuk mulai mencatat sesi belajar.</div></div>`;
    return;
  }
  const sessionCounts = {};
  sessions.forEach(s => sessionCounts[s.subject_id] = (sessionCounts[s.subject_id] || 0) + 1);
  const minCounts = {};
  sessions.forEach(s => minCounts[s.subject_id] = (minCounts[s.subject_id] || 0) + s.duration_minutes);

  grid.innerHTML = subjects.map(s => `
    <div class="card subject-card">
      <div class="subject-card-accent" style="background:${s.color}"></div>
      <div class="subject-card-name">${s.name}</div>
      <div class="subject-card-meta">${sessionCounts[s.id] || 0} sesi · ${((minCounts[s.id]||0)/60).toFixed(1)} jam</div>
      <div class="subject-card-actions">
        <button class="btn btn-ghost btn-sm" onclick="openSubjectModal(${s.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSubject(${s.id})">Hapus</button>
      </div>
    </div>`).join('');
}

function openSubjectModal(id = null) {
  editSubjectId = id;
  const modalTitle = document.getElementById('subject-modal-title');
  if (modalTitle) {
    modalTitle.textContent = id ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah';
  }
  if (id) {
    const s = subjects.find(x => x.id === id);
    document.getElementById('subject-name').value = s.name;
    document.getElementById('subject-color').value = s.color;
  } else {
    document.getElementById('subject-name').value = '';
    document.getElementById('subject-color').value = '#2563EB';
  }
  openModal('modal-subject');
}

async function saveSubject() {
  const name = document.getElementById('subject-name').value.trim();
  const color = document.getElementById('subject-color').value;
  if (!name) { toast('Nama mata kuliah wajib diisi'); return; }

  const method = editSubjectId ? 'PUT' : 'POST';
  const url = editSubjectId ? `${API}/subjects/${editSubjectId}` : `${API}/subjects`;
  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) });

  closeModal('modal-subject');
  await loadSubjects();
  await loadSessions();
  renderSubjects();
  if (typeof loadStats === 'function') loadStats();
  toast(editSubjectId ? 'Mata kuliah diperbarui' : 'Mata kuliah ditambahkan');
}

async function deleteSubject(id) {
  const s = subjects.find(x => x.id === id);
  if (!confirm(`Hapus "${s.name}"? Semua sesi terkait juga akan dihapus.`)) return;
  await fetch(`${API}/subjects/${id}`, { method: 'DELETE' });
  await loadSubjects();
  await loadSessions();
  renderSubjects();
  if (typeof loadStats === 'function') loadStats();
  toast('Mata kuliah dihapus');
}
