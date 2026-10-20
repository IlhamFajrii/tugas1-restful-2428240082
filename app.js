
require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

// ==================================================
// KONFIGURASI
// ==================================================

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin",
        process.env.CORS_ORIGIN || "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers",
        "Content-Type, x-api-key");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// ==================================================
// MIDDLEWARE API KEY
// ==================================================

function cekApiKey(req, res, next) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return res.status(401).json({
            status: "error",
            message: "API key wajib disertakan"
        });
    }

    if (!API_KEY || apiKey !== API_KEY) {
        return res.status(401).json({
            status: "error",
            message: "API key tidak valid"
        });
    }

    next();
}

// ==================================================
// DATA AWAL POLIS
// ==================================================

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
// GET - INFORMASI API
// GET /
// ==================================================

app.get("/", (req, res) => {
    res.status(200).json({
        nama: "Muhammad Ilham Fajri",
        nim: "2428240082",
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

// ==================================================
// GET - SEMUA POLIS DAN FILTER JENIS
// GET /insurance-policies
// GET /insurance-policies?jenis=kesehatan
// ==================================================

app.get("/insurance-policies", (req, res) => {
    const { jenis } = req.query;

    if (!jenis) {
        return res.status(200).json(insurancePolicies);
    }

    const hasil = insurancePolicies.filter(
        item => item.jenis.toLowerCase() === String(jenis).toLowerCase()
    );

    return res.status(200).json(hasil);
});

// ==================================================
// GET - POLIS BERDASARKAN ID
// GET /insurance-policies/:id
// ==================================================

app.get("/insurance-policies/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            status: "error",
            message: "ID polis tidak valid",
            data: null
        });
    }

    const policy = insurancePolicies.find(item => item.id === id);

    if (!policy) {
        return res.status(404).json({
            status: "error",
            message: `Data dengan id ${id} tidak ditemukan`,
            data: null
        });
    }

    return res.status(200).json(policy);
});

// ==================================================
// POST - TAMBAH POLIS
// POST /insurance-policies
// Membutuhkan API key
// ==================================================

app.post("/insurance-policies", cekApiKey, (req, res) => {
    const {
        nomorPolis,
        namaPemegang,
        jenis,
        premiBulanan,
        tanggalMulai
    } = req.body || {};

    // Validasi field wajib
    if (
        typeof nomorPolis !== "string" || !nomorPolis.trim() ||
        typeof namaPemegang !== "string" || !namaPemegang.trim() ||
        typeof jenis !== "string" || !jenis.trim() ||
        premiBulanan === undefined ||
        typeof premiBulanan !== "number" ||
        !Number.isFinite(premiBulanan) ||
        premiBulanan <= 0 ||
        typeof tanggalMulai !== "string" || !tanggalMulai.trim()
    ) {
        return res.status(400).json({
            status: "error",
            message: "Data polis tidak lengkap atau tidak valid",
            data: null
        });
    }

    // Nomor polis harus unik
    const nomorSudahAda = insurancePolicies.some(
        item => item.nomorPolis === nomorPolis.trim()
    );

    if (nomorSudahAda) {
        return res.status(400).json({
            status: "error",
            message: "Nomor polis sudah terdaftar",
            data: null
        });
    }

    const newPolicy = {
        id: nextId++,
        nomorPolis: nomorPolis.trim(),
        namaPemegang: namaPemegang.trim(),
        jenis: jenis.trim().toLowerCase(),
        premiBulanan,
        tanggalMulai: tanggalMulai.trim()
    };

    insurancePolicies.push(newPolicy);

    return res.status(201).json({
        status: "success",
        message: "Data berhasil ditambahkan",
        data: newPolicy
    });
});

// ==================================================
// PUT - UBAH POLIS
// PUT /insurance-policies/:id
// ==================================================

app.put("/insurance-policies/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            status: "error",
            message: "ID polis tidak valid",
            data: null
        });
    }

    const index = insurancePolicies.findIndex(item => item.id === id);

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
    } = req.body || {};

    if (
        typeof nomorPolis !== "string" || !nomorPolis.trim() ||
        typeof namaPemegang !== "string" || !namaPemegang.trim() ||
        typeof jenis !== "string" || !jenis.trim() ||
        typeof premiBulanan !== "number" ||
        !Number.isFinite(premiBulanan) ||
        premiBulanan <= 0 ||
        typeof tanggalMulai !== "string" || !tanggalMulai.trim()
    ) {
        return res.status(400).json({
            status: "error",
            message: "Data polis tidak lengkap atau tidak valid",
            data: null
        });
    }

    const nomorDipakai = insurancePolicies.some(
        (item, i) =>
            i !== index && item.nomorPolis === nomorPolis.trim()
    );

    if (nomorDipakai) {
        return res.status(400).json({
            status: "error",
            message: "Nomor polis sudah digunakan",
            data: null
        });
    }

    const updatedPolicy = {
        id,
        nomorPolis: nomorPolis.trim(),
        namaPemegang: namaPemegang.trim(),
        jenis: jenis.trim().toLowerCase(),
        premiBulanan,
        tanggalMulai: tanggalMulai.trim()
    };

    insurancePolicies[index] = updatedPolicy;

    return res.status(200).json({
        status: "success",
        message: "Data berhasil diperbarui",
        data: updatedPolicy
    });
});

// ==================================================
// DELETE - HAPUS POLIS
// DELETE /insurance-policies/:id
// ==================================================

app.delete("/insurance-policies/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            status: "error",
            message: "ID polis tidak valid",
            data: null
        });
    }

    const index = insurancePolicies.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            status: "error",
            message: `Data dengan id ${id} tidak ditemukan`,
            data: null
        });
    }

    insurancePolicies.splice(index, 1);

    return res.status(200).json({
        status: "success",
        message: `Data dengan id ${id} berhasil dihapus`,
        data: null
    });
});

// ==================================================
// CATCH-ALL 404
// ==================================================

app.use((req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Endpoint tidak ditemukan",
        data: null
    });
});

// ==================================================
// ERROR HANDLER
// ==================================================

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            status: "error",
            message: "Format JSON tidak valid"
        });
    }

    console.error(err);

    return res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan internal server"
    });
});

// ==================================================
// JALANKAN SERVER
// ==================================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;
