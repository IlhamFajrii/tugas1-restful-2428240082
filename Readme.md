# Tugas RESTful API Asuransi

## Teknologi
- Node.js + Express
- MongoDB + Mongoose
- Postman

## Menjalankan secara lokal
1. Pastikan Node.js dan MongoDB sudah terpasang dan service MongoDB berjalan.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env`, lalu atur `API_KEY` dan `MONGODB_URI`.
4. Jalankan `npm run dev`.
5. Buka `http://localhost:3000/`.

## Struktur data
- `Customer` adalah schema nasabah.
- `InsurancePolicy.customer` menggunakan referencing (`ObjectId` + `ref: "Customer"`).
- `InsurancePolicy.pertanggungan` menggunakan embedding: detail pertanggungan disimpan di dalam dokumen polis.
- `populate("customer", ...)` mengambil detail nasabah yang direferensikan.

## Endpoint
- `GET /insurance-policies` - daftar polis dengan filter, pagination, sorting, projection, dan populate nasabah
- `GET /insurance-policies/:id` - detail polis
- `POST /insurance-policies` - tambah polis (API key)
- `PUT /insurance-policies/:id` - ubah polis (API key)
- `DELETE /insurance-policies/:id` - hapus polis (API key)
- `GET /customers` - daftar nasabah
- `POST /customers` - tambah nasabah (API key)

## Query parameter daftar polis
- Filtering: `jenis`, `namaPemegang`, `customerId`, `minPremi`, `maxPremi`
- Pagination: `page`, `limit` (maksimal 100)
- Sorting: `sortBy` (`nomorPolis`, `jenis`, `premiBulanan`, `tanggalMulai`, `createdAt`, `updatedAt`), `order=asc|desc`
- Projection: `fields=nomorPolis,jenis,premiBulanan`

Contoh:
`GET /insurance-policies?jenis=kesehatan&minPremi=100000&maxPremi=500000&page=1&limit=5&sortBy=premiBulanan&order=desc&fields=nomorPolis,jenis,premiBulanan,customer,pertanggungan`

Header untuk POST/PUT/DELETE:
`x-api-key: nilai_API_KEY_di_file_env`

## Contoh body membuat nasabah
```json
{
  "nama": "Andi Wijaya",
  "email": "andi@example.com",
  "nomorTelepon": "081234567890",
  "alamat": "Palembang"
}
```

## Contoh body membuat polis dengan referencing
```json
{
  "nomorPolis": "POL-2026-0187",
  "customerId": "ID_CUSTOMER_DARI_RESPONS_POST_CUSTOMERS",
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

Alternatif, saat membuat polis bisa mengirim `namaPemegang` dan `emailPemegang`; API akan mencari nasabah berdasarkan email dan membuatnya bila belum ada.

## Catatan
Data awal sebelumnya disimpan di array JavaScript. Versi ini menggunakan MongoDB, sehingga data lama dalam array tidak otomatis dipindahkan. Buat data nasabah lalu polis lewat Postman setelah koneksi database aktif.
