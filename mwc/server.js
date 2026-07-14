const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── DB helpers ───────────────────────────────────────────────────────────────
function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        const init = { subjects: [], sessions: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
        return init;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(arr) {
    return arr.length === 0 ? 1 : Math.max(...arr.map(i => i.id)) + 1;
}

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────
// GET all subjects
app.get('/api/subjects', (req, res) => {
    const db = readDB();
    res.json(db.subjects);
});

// POST create subject
app.post('/api/subjects', (req, res) => {
    const { name, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

    const db = readDB();
    const subject = {
        id: nextId(db.subjects),
        name: name.trim(),
        color: color || '#4F46E5',
        created_at: new Date().toISOString()
    };
    db.subjects.push(subject);
    writeDB(db);
    res.status(201).json(subject);
});

// PUT update subject
app.put('/api/subjects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, color } = req.body;
    const db = readDB();
    const idx = db.subjects.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Subject not found' });
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

    db.subjects[idx] = { ...db.subjects[idx], name: name.trim(), color: color || db.subjects[idx].color };
    writeDB(db);
    res.json(db.subjects[idx]);
});

// DELETE subject (also deletes its sessions)
app.delete('/api/subjects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDB();
    const exists = db.subjects.find(s => s.id === id);
    if (!exists) return res.status(404).json({ error: 'Subject not found' });

    db.subjects = db.subjects.filter(s => s.id !== id);
    db.sessions = db.sessions.filter(s => s.subject_id !== id);
    writeDB(db);
    res.json({ message: 'Deleted' });
});

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
// GET all sessions (optionally filter by subject)
app.get('/api/sessions', (req, res) => {
    const db = readDB();
    const { subject_id } = req.query;
    let sessions = db.sessions;
    if (subject_id) sessions = sessions.filter(s => s.subject_id === parseInt(subject_id));
    // Attach subject name
    const result = sessions.map(s => ({
        ...s,
        subject_name: db.subjects.find(sub => sub.id === s.subject_id)?.name || 'Unknown',
        subject_color: db.subjects.find(sub => sub.id === s.subject_id)?.color || '#ccc'
    }));
    res.json(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// POST create session
app.post('/api/sessions', (req, res) => {
    const { subject_id, date, duration_minutes, notes } = req.body;
    if (!subject_id || !date || !duration_minutes)
        return res.status(400).json({ error: 'subject_id, date, and duration_minutes are required' });

    const db = readDB();
    const subject = db.subjects.find(s => s.id === parseInt(subject_id));
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const session = {
        id: nextId(db.sessions),
        subject_id: parseInt(subject_id),
        date,
        duration_minutes: parseInt(duration_minutes),
        notes: notes?.trim() || '',
        created_at: new Date().toISOString()
    };
    db.sessions.push(session);
    writeDB(db);
    res.status(201).json(session);
});

// PUT update session
app.put('/api/sessions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { subject_id, date, duration_minutes, notes } = req.body;
    const db = readDB();
    const idx = db.sessions.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Session not found' });

    db.sessions[idx] = {
        ...db.sessions[idx],
        subject_id: parseInt(subject_id) || db.sessions[idx].subject_id,
        date: date || db.sessions[idx].date,
        duration_minutes: parseInt(duration_minutes) || db.sessions[idx].duration_minutes,
        notes: notes?.trim() ?? db.sessions[idx].notes
    };
    writeDB(db);
    res.json(db.sessions[idx]);
});

// DELETE session
app.delete('/api/sessions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDB();
    if (!db.sessions.find(s => s.id === id)) return res.status(404).json({ error: 'Session not found' });

    db.sessions = db.sessions.filter(s => s.id !== id);
    writeDB(db);
    res.json({ message: 'Deleted' });
});

// ─── STATS ────────────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
    const db = readDB();
    const stats = db.subjects.map(sub => {
        const sessions = db.sessions.filter(s => s.subject_id === sub.id);
        const total_minutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
        return {
            subject_id: sub.id,
            subject_name: sub.name,
            subject_color: sub.color,
            total_sessions: sessions.length,
            total_minutes,
            total_hours: (total_minutes / 60).toFixed(1)
        };
    });
    res.json(stats);
});

app.listen(PORT, () => console.log(`Study Tracker running at http://localhost:${PORT}`));