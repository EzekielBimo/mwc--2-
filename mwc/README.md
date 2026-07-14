# Study Tracker

Aplikasi pelacak sesi belajar (Study Session Tracker) berbasis web yang dilengkapi dengan dashboard statistik, manajemen mata kuliah, pencatatan durasi belajar, dan modul catatan materi mandiri maupun berbasis sesi. Aplikasi ini terdiri dari frontend vanilla JavaScript modern dan terhubung dengan backend REST API (Node.js/Express).

---

## 📁 Struktur Proyek

Berikut adalah struktur folder dan file utama dalam proyek ini:

```text
mwc/
├── .agents/               # Folder konfigurasi agen AI
├── data.json              # Database file lokal (JSON format)
├── package.json           # Dependensi Node.js & definisi scripts
├── package-lock.json      # Versi terkunci dari package/dependensi
├── server.js              # Entrypoint server backend REST API (Express)
├── refactor.js            # Skrip utilitas untuk refaktorisasi index.html
├── skills-lock.json       # Metadata status lock dari skills agen
└── public/                # File statis Frontend (Client-side)
    ├── index.html         # Halaman utama aplikasi (UI markup)
    ├── style.css          # Desain visual & layout styling (CSS)
    ├── app.js             # Inisialisasi, navigasi halaman, & helper API
    ├── dashboard.js       # Logika statistik dashboard & grafik
    ├── subjects.js        # Manajemen data Mata Kuliah (Subjects)
    ├── sessions.js        # Manajemen data Sesi Belajar (Sessions)
    └── notes.js           # Manajemen Catatan Materi (Notes)
```

---

## ⚙️ Komponen & Deskripsi File

### 1. Backend & Konfigurasi (`/`)
* **`server.js`**: Menyediakan REST API dengan Express untuk mengelola operasi CRUD (Create, Read, Update, Delete) data belajar yang disimpan ke `data.json`.
* **`data.json`**: Penyimpanan data lokal sederhana. Berisi tiga tabel relasional utama: `subjects`, `sessions`, dan `notes`.
* **`package.json`**: Mendefinisikan konfigurasi Node.js, pustaka yang diperlukan (`express`, `cors`), serta skrip perintah (`npm start`, `npm run dev`).
* **`refactor.js`**: File skrip pembantu untuk mengekstrak inline CSS & JS dari `index.html` lama ke file modular di dalam folder `public/`.

### 2. Frontend (`/public`)
* **`index.html`**: Kerangka antarmuka pengguna (Single Page Application) yang dibagi menjadi beberapa tab menu: *Dashboard*, *Mata Kuliah*, *Sesi Belajar*, dan *Catatan Materi*.
* **`style.css`**: Berisi seluruh aturan gaya (styling) modern seperti layout grid/flexbox, variabel warna CSS, modal dialog, efek transisi, dan responsivitas mobile.
* **`app.js`**: Endpoint API terpusat (`http://localhost:3000/api`), inisialisasi aplikasi, navigasi tab menu (`switchPage`), helper format tanggal, serta notifikasi Toast.
* **`dashboard.js`**: Memuat grafik bar horizontal untuk durasi belajar per mata kuliah serta menampilkan ringkasan data statistik dan daftar sesi belajar terbaru.
* **`subjects.js`**: Mengurus alur tambah, edit, hapus, dan tampil data mata kuliah di tab *Mata Kuliah*.
* **`sessions.js`**: Mengurus tabel daftar sesi belajar beserta penautan tombol catatan materi per sesi.
* **`notes.js`**: Mengurus pembuatan catatan materi pelajaran secara mandiri (independent) maupun catatan yang terikat pada sesi belajar tertentu.

---

## 📊 Skema Data (`data.json`)

Aplikasi ini menggunakan struktur data relasional sederhana berbasis JSON:

```json
{
  "subjects": [
    {
      "id": 1,
      "name": "NAMA MATA KULIAH",
      "color": "#HEXCODE",
      "created_at": "ISO-TIMESTAMP"
    }
  ],
  "sessions": [
    {
      "id": 1,
      "subject_id": 1,
      "date": "YYYY-MM-DD",
      "duration_minutes": 120,
      "notes": "Topik bahasan sesi belajar",
      "created_at": "ISO-TIMESTAMP"
    }
  ],
  "notes": [
    {
      "id": 1,
      "subject_id": 1,
      "session_id": null, // bernilai ID sesi jika terikat sesi belajar
      "date": "YYYY-MM-DD",
      "content": "Isi catatan detail materi kuliah",
      "created_at": "ISO-TIMESTAMP"
    }
  ]
}
```

---

## 🔌 Spesifikasi REST API

Backend Express menyediakan endpoint API berikut di `http://localhost:3000/api`:

### 1. Statistik (Dashboard)
* **`GET /api/stats`**: Mendapatkan durasi belajar akumulatif (menit) dan total sesi yang dikelompokkan per mata kuliah untuk kebutuhan visualisasi grafik.

### 2. Mata Kuliah (Subjects)
* **`GET /api/subjects`**: Mengambil daftar semua mata kuliah.
* **`POST /api/subjects`**: Menambah mata kuliah baru (memerlukan `name` dan `color`).
* **`PUT /api/subjects/:id`**: Memperbarui mata kuliah berdasarkan ID.
* **`DELETE /api/subjects/:id`**: Menghapus mata kuliah beserta seluruh data sesi terkait.

### 3. Sesi Belajar (Sessions)
* **`GET /api/sessions`**: Mengambil semua sesi belajar (beserta nama dan warna mata kuliah terkait).
* **`POST /api/sessions`**: Mencatat sesi belajar baru (memerlukan `subject_id`, `date`, `duration_minutes`, dan `notes`).
* **`PUT /api/sessions/:id`**: Memperbarui detail sesi belajar berdasarkan ID.
* **`DELETE /api/sessions/:id`**: Menghapus sesi belajar berdasarkan ID.

### 4. Catatan Materi (Notes)
* **`GET /api/notes`**: Mengambil semua catatan materi kuliah.
* **`POST /api/notes`**: Menambahkan catatan materi baru (baik mandiri maupun terikat `session_id`).
* **`PUT /api/notes/:id`**: Mengubah isi catatan materi berdasarkan ID.
* **`DELETE /api/notes/:id`**: Menghapus catatan materi berdasarkan ID.

---

## 🚀 Cara Menjalankan Project

### Prasyarat
* Memiliki **Node.js** terinstal pada sistem Anda.

### Langkah-langkah
1. **Instalasi Dependensi**
   Jalankan perintah berikut di root direktori untuk menginstal Express dan CORS:
   ```bash
   npm install
   ```

2. **Menjalankan Server Backend**
   Jalankan server Node.js:
   ```bash
   npm start
   # atau
   npm run dev
   ```
   Server backend akan aktif di `http://localhost:3000`.

3. **Membuka Aplikasi Frontend**
   Buka file `public/index.html` secara langsung di peramban (browser) atau menggunakan server web lokal seperti Laragon, Live Server, atau XAMPP yang menunjuk ke folder `public/`.
