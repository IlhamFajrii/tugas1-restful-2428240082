const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
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

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
