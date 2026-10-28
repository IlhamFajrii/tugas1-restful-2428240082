# 🛡️ RESTful API Asuransi

> **Tugas 1 & 2 — Pemrograman Aplikasi Web**
>
> **Nama:** Muhammad Ilham Fajri
> **NIM:** 2428240082
> **Topik:** 20 — Asuransi

API RESTful untuk manajemen polis asuransi dan data nasabah, dibangun menggunakan **Node.js + Express** dengan database **MongoDB** melalui **Mongoose**. API ini menerapkan pola **Referencing** (Customer ↔ InsurancePolicy) dan **Embedding** (Pertanggungan di dalam dokumen Polis).

---

## 📑 Daftar Isi

- [Teknologi](#-teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Model Data](#-model-data)
- [Instalasi & Menjalankan Lokal](#-instalasi--menjalankan-lokal)
- [Variabel Lingkungan](#-variabel-lingkungan)
- [Endpoint API](#-endpoint-api)
  - [Root](#get-)
  - [Polis Asuransi](#polis-asuransi)
  - [Nasabah (Customer)](#nasabah-customer)
- [Query Parameter](#-query-parameter-get-insurance-policies)
- [Autentikasi](#-autentikasi-api-key)
- [Contoh Request & Response](#-contoh-request--response)
- [Penanganan Error](#-penanganan-error)
- [Deploy ke Vercel](#-deploy-ke-vercel)

---

## 🔧 Teknologi

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Node.js | ≥ 18 | Runtime JavaScript |
| Express | ^5.2.1 | Framework HTTP |
| Mongoose | ^8.19.1 | ODM untuk MongoDB |
| dotenv | ^18.0.8 | Manajemen variabel lingkungan |
| nodemon | ^3.1.14 | Auto-restart saat pengembangan (devDependency) |
| MongoDB | ≥ 6 | Database NoSQL |

---

## 📁 Struktur Proyek

```
tugas1-restful-2428240082/
├── models/
│   ├── Customer.js            # Schema & Model nasabah
│   └── InsurancePolicy.js     # Schema & Model polis asuransi
├── Berkas Collection Postman/
│   └── Asuransi-API-Collection.postman_collection.json
├── Berkas Enviroment Postman/
│   └── Asuransi-Local-Environment.postman_environment.json
├── Hasil screenshot/
│   ├── DATA MongoDB/
│   ├── UJI GET/
│   └── UJI POST/
├── app.js                     # Entry point & definisi semua route
├── .env                       # Variabel lingkungan (tidak di-commit)
├── .env.example               # Contoh variabel lingkungan
├── vercel.json                # Konfigurasi deploy Vercel
└── package.json
```

---

## 🗄️ Model Data

### Customer (Referencing)

Field `customer` pada `InsurancePolicy` menyimpan `ObjectId` yang merujuk ke dokumen dalam collection `customers`.

| Field | Tipe | Keterangan |
|-------|------|------------|
| `nama` | String | **Wajib** — Nama lengkap nasabah |
| `email` | String | **Wajib, Unik** — Email (otomatis lowercase) |
| `nomorTelepon` | String | Nomor telepon (opsional) |
| `alamat` | String | Alamat lengkap (opsional) |
| `createdAt` | Date | Otomatis diisi Mongoose |
| `updatedAt` | Date | Otomatis diisi Mongoose |

### InsurancePolicy (Referencing + Embedding)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `nomorPolis` | String | **Wajib, Unik** — Nomor polis |
| `customer` | ObjectId | **Wajib** — Referensi ke `Customer._id` |
| `jenis` | String | **Wajib** — Enum: `kesehatan`, `jiwa`, `kendaraan`, `properti`, `perjalanan` |
| `premiBulanan` | Number | **Wajib** — Nilai > 0 |
| `tanggalMulai` | String | **Wajib** — Format tanggal (misal: `2026-01-01`) |
| `pertanggungan` | Array | **Embedded** — Array objek detail manfaat |
| `createdAt` | Date | Otomatis diisi Mongoose |
| `updatedAt` | Date | Otomatis diisi Mongoose |

#### Sub-dokumen `pertanggungan` (Embedded)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `nama` | String | **Wajib** — Nama manfaat (misal: `Rawat Inap`) |
| `batasManfaat` | Number | **Wajib** — Batas nilai manfaat (≥ 0) |
| `keterangan` | String | Keterangan tambahan (opsional) |

---

## 🚀 Instalasi & Menjalankan Lokal

**Prasyarat:** Node.js ≥ 18 dan MongoDB sudah terinstal dan berjalan.

```bash
# 1. Clone repositori
git clone https://github.com/IlhamFajrii/tugas1-restful-2428240082.git
cd tugas1-restful-2428240082

# 2. Install dependensi
npm install

# 3. Salin file .env dan isi konfigurasi
copy .env.example .env

# 4. Jalankan server (mode development dengan nodemon)
npm run dev

# Atau mode production
npm start
```

Server akan berjalan di: **http://localhost:3000**

---

## ⚙️ Variabel Lingkungan

Salin `.env.example` menjadi `.env` dan sesuaikan nilainya:

```env
PORT=3000
API_KEY=kunci-rahasia-paw2
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/asuransi_api
```

| Variabel | Keterangan |
|----------|------------|
| `PORT` | Port server (default: `3000`) |
| `API_KEY` | Kunci rahasia untuk endpoint yang terproteksi |
| `CORS_ORIGIN` | Origin yang diizinkan untuk CORS |
| `MONGODB_URI` | URI koneksi MongoDB |

---

## 📡 Endpoint API

### `GET /`

Informasi umum API dan daftar semua endpoint yang tersedia.

```
GET http://localhost:3000/
```

**Response 200:**
```json
{
  "nama": "Muhammad Ilham Fajri",
  "nim": "2428240082",
  "topik": "20 - Asuransi",
  "database": "MongoDB + Mongoose",
  "endpoint": ["..."]
}
```

---

### Polis Asuransi

#### `GET /insurance-policies`

Ambil daftar polis asuransi dengan dukungan **filtering**, **pagination**, **sorting**, **projection**, dan **populate** data nasabah.

```
GET /insurance-policies?jenis=kesehatan&page=1&limit=10&sortBy=premiBulanan&order=desc
```

> Lihat [Query Parameter](#-query-parameter-get-insurance-policies) untuk daftar lengkap.

---

#### `GET /insurance-policies/:id`

Ambil detail satu polis berdasarkan `_id` MongoDB, termasuk data nasabah yang di-populate.

```
GET /insurance-policies/64f1a2b3c4d5e6f7a8b9c0d1
```

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "nomorPolis": "POL-2026-0001",
    "customer": {
      "_id": "...",
      "nama": "Andi Wijaya",
      "email": "andi@example.com",
      "nomorTelepon": "081234567890",
      "alamat": "Palembang"
    },
    "jenis": "kesehatan",
    "premiBulanan": 350000,
    "tanggalMulai": "2026-01-01",
    "pertanggungan": [
      {
        "nama": "Rawat Inap",
        "batasManfaat": 50000000,
        "keterangan": "Maksimal sesuai ketentuan polis"
      }
    ]
  }
}
```

---

#### `POST /insurance-policies` 🔒

Tambah polis baru. Memerlukan **API Key**.

Terdapat dua cara menentukan nasabah:

**Cara 1 — Gunakan nasabah yang sudah ada (via `customerId`):**
```json
{
  "nomorPolis": "POL-2026-0187",
  "customerId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "jenis": "kesehatan",
  "premiBulanan": 350000,
  "tanggalMulai": "2026-01-01",
  "pertanggungan": [
    {
      "nama": "Rawat Inap",
      "batasManfaat": 50000000,
      "keterangan": "Maksimal sesuai ketentuan polis"
    }
  ]
}
```

**Cara 2 — Buat nasabah baru sekaligus (via `namaPemegang` + `emailPemegang`):**
```json
{
  "nomorPolis": "POL-2026-0188",
  "namaPemegang": "Budi Santoso",
  "emailPemegang": "budi@example.com",
  "jenis": "jiwa",
  "premiBulanan": 200000,
  "tanggalMulai": "2026-03-01",
  "pertanggungan": []
}
```

> API akan mencari nasabah berdasarkan email; jika belum ada, nasabah baru akan dibuat otomatis.

---

#### `PUT /insurance-policies/:id` 🔒

Perbarui data polis. Semua field bersifat opsional (partial update). Memerlukan **API Key**.

```json
{
  "premiBulanan": 400000,
  "jenis": "kesehatan",
  "pertanggungan": [
    {
      "nama": "Rawat Jalan",
      "batasManfaat": 10000000,
      "keterangan": "Termasuk konsultasi dokter umum"
    }
  ]
}
```

---

#### `DELETE /insurance-policies/:id` 🔒

Hapus polis berdasarkan `_id`. Memerlukan **API Key**.

```
DELETE /insurance-policies/64f1a2b3c4d5e6f7a8b9c0d1
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Data polis berhasil dihapus",
  "data": null
}
```

---

### Nasabah (Customer)

#### `GET /customers`

Ambil daftar nasabah dengan dukungan **filter nama** dan **pagination**.

```
GET /customers?nama=andi&page=1&limit=10
```

| Query | Keterangan |
|-------|------------|
| `nama` | Filter nama nasabah (case-insensitive, regex) |
| `page` | Halaman (default: `1`) |
| `limit` | Jumlah per halaman, maks `100` (default: `10`) |

---

#### `POST /customers` 🔒

Tambah nasabah baru. Memerlukan **API Key**.

```json
{
  "nama": "Andi Wijaya",
  "email": "andi@example.com",
  "nomorTelepon": "081234567890",
  "alamat": "Palembang"
}
```

**Response 201:**
```json
{
  "status": "success",
  "message": "Data nasabah berhasil ditambahkan",
  "data": {
    "_id": "...",
    "nama": "Andi Wijaya",
    "email": "andi@example.com",
    "nomorTelepon": "081234567890",
    "alamat": "Palembang",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 🔍 Query Parameter `GET /insurance-policies`

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `jenis` | String | — | Filter jenis polis: `kesehatan`, `jiwa`, `kendaraan`, `properti`, `perjalanan` |
| `namaPemegang` | String | — | Filter nama nasabah (case-insensitive) |
| `customerId` | String | — | Filter berdasarkan `_id` nasabah |
| `minPremi` | Number | — | Batas bawah premi bulanan |
| `maxPremi` | Number | — | Batas atas premi bulanan |
| `page` | Integer | `1` | Nomor halaman (≥ 1) |
| `limit` | Integer | `10` | Jumlah data per halaman (1–100) |
| `sortBy` | String | `createdAt` | Field pengurutan: `nomorPolis`, `jenis`, `premiBulanan`, `tanggalMulai`, `createdAt`, `updatedAt` |
| `order` | String | `asc` | Arah pengurutan: `asc` atau `desc` |
| `fields` | String | — | Projection field (pisah koma): misal `nomorPolis,jenis,premiBulanan` |

**Contoh lengkap:**
```
GET /insurance-policies?jenis=kesehatan&minPremi=100000&maxPremi=500000&page=1&limit=5&sortBy=premiBulanan&order=desc&fields=nomorPolis,jenis,premiBulanan,customer,pertanggungan
```

---

## 🔑 Autentikasi API Key

Endpoint yang bertanda 🔒 memerlukan header `x-api-key`:

```
x-api-key: nilai_API_KEY_di_file_env
```

| Kode | Kondisi |
|------|---------|
| `401` | API key tidak disertakan atau tidak valid |

---

## ⚠️ Penanganan Error

Semua respons error mengikuti format:

```json
{
  "status": "error",
  "message": "Pesan kesalahan yang deskriptif"
}
```

| Kode HTTP | Kondisi |
|-----------|---------|
| `400` | Validasi gagal, format JSON tidak valid, parameter tidak valid |
| `401` | API key tidak disertakan atau tidak valid |
| `404` | Data tidak ditemukan / endpoint tidak ada |
| `409` | Nomor polis atau email sudah terdaftar (duplicate key) |
| `500` | Kesalahan internal server |

---

## ☁️ Deploy ke Vercel

Proyek sudah dikonfigurasi untuk deploy ke Vercel melalui [`vercel.json`](vercel.json):

```json
{
  "version": 2,
  "builds": [{ "src": "app.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "app.js" }]
}
```

**Langkah deploy:**
1. Install Vercel CLI: `npm i -g vercel`
2. Jalankan `vercel` di root proyek
3. Tambahkan variabel lingkungan (`API_KEY`, `MONGODB_URI`, dll.) melalui dashboard Vercel

> **Catatan:** Gunakan MongoDB Atlas untuk koneksi database di lingkungan cloud.

---

## 🧪 Pengujian dengan Postman

File collection dan environment tersedia di:
- `Berkas Collection Postman/Asuransi-API-Collection.postman_collection.json`
- `Berkas Enviroment Postman/Asuransi-Local-Environment.postman_environment.json`

**Cara import:**
1. Buka Postman → **Import**
2. Pilih file collection `.json`
3. Import juga file environment, lalu aktifkan environment **Asuransi-Local**
4. Pastikan server lokal berjalan sebelum menjalankan request

---

## 📝 Catatan

- Data asuransi menggunakan pola **Referencing** untuk relasi Customer ↔ InsurancePolicy (`ObjectId` + `populate`).
- Detail manfaat (`pertanggungan`) menggunakan pola **Embedding** langsung di dalam dokumen polis.
- Semua endpoint GET bersifat publik; endpoint POST/PUT/DELETE memerlukan API key.
- Jenis polis yang valid: `kesehatan`, `jiwa`, `kendaraan`, `properti`, `perjalanan`.

---

<div align="center">
  <sub>Muhammad Ilham Fajri — NIM 2428240082</sub>
</div>
