const express = require("express");

const app = express();

app.use(express.json());
// GET - Informasi API
// URL: GET /
app.get("/", (req, res) => {
  res.json({
    nama: "Muhammad Ilham Fajri",
    nim: "[ISI NIM]",
    topik: "20 - Asuransi",
    endpoint: [
      "GET /insurance-policies",
      "GET /insurance-policies/:id",
      "POST /insurance-policies",
      "PUT /insurance-policies/:id",
      "DELETE /insurance-policies/:id",
      "GET /insurance-policies?jenis=kesehatan"
    ]
  });
});
// GET - Informasi API
// URL: GET /

// Data awal polis asuransi
const insurancePolicies = [
  {
    id: 1,
    nomorPolis: "POL-2026-0187",
    namaPemegang: "Andi Wijaya",
    jenis: "kesehatan",
    premiBulanan: 350000,
    tanggalMulai: "2026-01-01"
  },
  {
    id: 2,
    nomorPolis: "POL-2026-0245",
    namaPemegang: "Budi Santoso",
    jenis: "jiwa",
    premiBulanan: 500000,
    tanggalMulai: "2026-02-15"
  },
  {
    id: 3,
    nomorPolis: "POL-2026-0312",
    namaPemegang: "Citra Lestari",
    jenis: "kendaraan",
    premiBulanan: 275000,
    tanggalMulai: "2026-03-10"
  }
];

let nextId = 4;


// ==================================================
// 1. GET - Menampilkan seluruh data polis
// URL: GET /insurance-policies
// ==================================================

app.get("/insurance-policies", (req, res) => {
  res.json(insurancePolicies);
});


// ==================================================
// 2. GET - Menampilkan satu data berdasarkan ID
// URL: GET /insurance-policies/:id
// ==================================================

app.get("/insurance-policies/:id", (req, res) => {
  const id = Number(req.params.id);

  const policy = insurancePolicies.find(
    (item) => item.id === id
  );

  if (!policy) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null
    });
  }

  res.json(policy);
});


// ==================================================
// 3. POST - Menambahkan data polis baru
// URL: POST /insurance-policies
// ==================================================
// Contoh body:
// {
//   "nomorPolis": "POL-2026-0401",
//   "namaPemegang": "Dedi Saputra",
//   "jenis": "kesehatan",
//   "premiBulanan": 400000,
//   "tanggalMulai": "2026-04-01"
// }

app.post("/insurance-policies", (req, res) => {
  const {
    nomorPolis,
    namaPemegang,
    jenis,
    premiBulanan,
    tanggalMulai
  } = req.body;

  const newPolicy = {
    id: nextId++,
    nomorPolis,
    namaPemegang,
    jenis,
    premiBulanan,
    tanggalMulai
  };

  insurancePolicies.push(newPolicy);

  res.status(201).json({
    status: "success",
    message: "Data berhasil ditambahkan",
    data: newPolicy
  });
});


// ==================================================
// 4. PUT - Mengubah seluruh data polis
// URL: PUT /insurance-policies/:id
// ==================================================
// Contoh body:
// {
//   "nomorPolis": "POL-2026-0187",
//   "namaPemegang": "Andi Wijaya Updated",
//   "jenis": "jiwa",
//   "premiBulanan": 450000,
//   "tanggalMulai": "2026-01-15"
// }

app.put("/insurance-policies/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = insurancePolicies.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null
    });
  }

  const {
    nomorPolis,
    namaPemegang,
    jenis,
    premiBulanan,
    tanggalMulai
  } = req.body;

  const updatedPolicy = {
    id: id,
    nomorPolis,
    namaPemegang,
    jenis,
    premiBulanan,
    tanggalMulai
  };

  insurancePolicies[index] = updatedPolicy;

  res.json({
    status: "success",
    message: "Data berhasil diperbarui",
    data: updatedPolicy
  });
});


// ==================================================
// 5. DELETE - Menghapus data polis
// URL: DELETE /insurance-policies/:id
// ==================================================

app.delete("/insurance-policies/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = insurancePolicies.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null
    });
  }

  insurancePolicies.splice(index, 1);

  res.json({
    status: "success",
    message: `Data dengan id ${id} berhasil dihapus`,
    data: null
  });
});

// ==========================================
// FILTER
// GET /insurance-policies?jenis=kesehatan
// ==========================================

app.get("/insurance-policies", (req, res) => {
  const { jenis } = req.query;

  // Jika tidak menggunakan filter
  if (!jenis) {
    return res.json(insurancePolicies);
  }

  // Filter berdasarkan jenis
  const hasil = insurancePolicies.filter(
    (item) => item.jenis === jenis
  );

  res.json(hasil);
});

// ==========================================
// CATCH-ALL 404
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint tidak ditemukan",
    data: null,
  });
});
// ==================================================
// Menjalankan server
// ==================================================

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;