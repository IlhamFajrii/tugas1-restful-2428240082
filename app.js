require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const InsurancePolicy = require("./models/InsurancePolicy");
const Customer = require("./models/Customer");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

function cekApiKey(req, res, next) {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ status: "error", message: "API key wajib disertakan" });
    if (!API_KEY || apiKey !== API_KEY) return res.status(401).json({ status: "error", message: "API key tidak valid" });
    next();
}

function errorHandler(err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ status: "error", message: "Format JSON tidak valid" });
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({ status: "error", message: err.message });
    }
    if (err.code === 11000) {
        return res.status(409).json({ status: "error", message: "Nomor polis atau email sudah terdaftar" });
    }
    if (err.name === "CastError") {
        return res.status(400).json({ status: "error", message: "ID atau parameter tidak valid" });
    }
    console.error(err);
    return res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server" });
}

app.get("/", (req, res) => {
    res.status(200).json({
        nama: "Muhammad Ilham Fajri",
        nim: "2428240082",
        topik: "20 - Asuransi",
        database: "MongoDB + Mongoose",
        endpoint: [
            "GET /insurance-policies",
            "GET /insurance-policies/:id",
            "POST /insurance-policies",
            "PUT /insurance-policies/:id",
            "DELETE /insurance-policies/:id",
            "GET /customers",
            "POST /customers",
            "GET /insurance-policies?jenis=kesehatan&page=1&limit=10&sortBy=premiBulanan&order=desc&fields=nomorPolis,jenis,premiBulanan"
        ]
    });
});

// LIST POLIS: filtering + pagination + sorting + projection + populate referencing
app.get("/insurance-policies", async (req, res, next) => {
    try {
        const {
            jenis, namaPemegang, customerId, minPremi, maxPremi,
            page = "1", limit = "10", sortBy = "id", order = "asc", fields
        } = req.query;

        const pageNum = Number(page);
        const limitNum = Number(limit);
        if (!Number.isInteger(pageNum) || pageNum < 1 || !Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({ status: "error", message: "page harus >= 1 dan limit harus 1-100" });
        }

        const filter = {};
        if (jenis) filter.jenis = String(jenis).toLowerCase();
        if (customerId) {
            if (!mongoose.isValidObjectId(customerId)) return res.status(400).json({ status: "error", message: "customerId tidak valid" });
            filter.customer = customerId;
        }
        if (namaPemegang) {
            const customers = await Customer.find({ nama: { $regex: String(namaPemegang), $options: "i" } }).select("_id");
            filter.customer = { $in: customers.map(c => c._id) };
        }
        if (minPremi !== undefined || maxPremi !== undefined) {
            filter.premiBulanan = {};
            if (minPremi !== undefined) {
                if (!Number.isFinite(Number(minPremi)) || Number(minPremi) < 0) return res.status(400).json({ status: "error", message: "minPremi harus berupa angka >= 0" });
                filter.premiBulanan.$gte = Number(minPremi);
            }
            if (maxPremi !== undefined) {
                if (!Number.isFinite(Number(maxPremi)) || Number(maxPremi) < 0) return res.status(400).json({ status: "error", message: "maxPremi harus berupa angka >= 0" });
                filter.premiBulanan.$lte = Number(maxPremi);
            }
        }

        const allowedSort = ["nomorPolis", "jenis", "premiBulanan", "tanggalMulai", "createdAt", "updatedAt"];
        const sortField = allowedSort.includes(sortBy) ? sortBy : "createdAt";
        const sortDirection = String(order).toLowerCase() === "desc" ? -1 : 1;
        const projection = fields ? String(fields).split(",").map(f => f.trim()).filter(f => /^[a-zA-Z][a-zA-Z0-9]*$/.test(f)).join(" ") : "";

        const total = await InsurancePolicy.countDocuments(filter);
        let query = InsurancePolicy.find(filter)
            .populate("customer", "nama email nomorTelepon")
            .sort({ [sortField]: sortDirection, _id: 1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        if (projection) query = query.select(projection);
        const data = await query;

        return res.status(200).json({
            status: "success",
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
            data
        });
    } catch (err) { next(err); }
});

app.get("/insurance-policies/:id", async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ status: "error", message: "ID polis tidak valid", data: null });
        const policy = await InsurancePolicy.findById(req.params.id).populate("customer", "nama email nomorTelepon alamat");
        if (!policy) return res.status(404).json({ status: "error", message: "Data polis tidak ditemukan", data: null });
        return res.status(200).json({ status: "success", data: policy });
    } catch (err) { next(err); }
});

// Endpoint customer untuk data yang direferensikan oleh polis
app.get("/customers", async (req, res, next) => {
    try {
        const { nama, page = "1", limit = "10" } = req.query;
        const p = Number(page), l = Number(limit);
        if (!Number.isInteger(p) || p < 1 || !Number.isInteger(l) || l < 1 || l > 100) {
            return res.status(400).json({ status: "error", message: "page harus >= 1 dan limit harus 1-100" });
        }
        const filter = nama ? { nama: { $regex: String(nama), $options: "i" } } : {};
        const total = await Customer.countDocuments(filter);
        const data = await Customer.find(filter).sort({ nama: 1 }).skip((p - 1) * l).limit(l);
        return res.status(200).json({ status: "success", pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }, data });
    } catch (err) { next(err); }
});

app.post("/customers", cekApiKey, async (req, res, next) => {
    try {
        const { nama, email, nomorTelepon, alamat } = req.body || {};
        if (typeof nama !== "string" || !nama.trim() || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ status: "error", message: "nama dan email wajib diisi" });
        }
        const customer = await Customer.create({
            nama: nama.trim(), email: email.trim().toLowerCase(),
            nomorTelepon: typeof nomorTelepon === "string" ? nomorTelepon.trim() : "",
            alamat: typeof alamat === "string" ? alamat.trim() : ""
        });
        return res.status(201).json({ status: "success", message: "Data nasabah berhasil ditambahkan", data: customer });
    } catch (err) { next(err); }
});

// POST polis: customerId mereferensikan Customer; pertanggungan tersimpan embedded di dokumen polis
app.post("/insurance-policies", cekApiKey, async (req, res, next) => {
    try {
        const { nomorPolis, customerId, namaPemegang, emailPemegang, jenis, premiBulanan, tanggalMulai, pertanggungan } = req.body || {};
        if (typeof nomorPolis !== "string" || !nomorPolis.trim() ||
            typeof jenis !== "string" || !jenis.trim() ||
            typeof premiBulanan !== "number" || !Number.isFinite(premiBulanan) || premiBulanan <= 0 ||
            typeof tanggalMulai !== "string" || !tanggalMulai.trim()) {
            return res.status(400).json({ status: "error", message: "nomorPolis, jenis, premiBulanan (> 0), dan tanggalMulai wajib valid" });
        }

        let customer;
        if (customerId) {
            if (!mongoose.isValidObjectId(customerId)) return res.status(400).json({ status: "error", message: "customerId tidak valid" });
            customer = await Customer.findById(customerId);
            if (!customer) return res.status(400).json({ status: "error", message: "Nasabah dengan customerId tersebut tidak ditemukan" });
        } else if (typeof namaPemegang === "string" && namaPemegang.trim() && typeof emailPemegang === "string" && emailPemegang.trim()) {
            customer = await Customer.findOne({ email: emailPemegang.trim().toLowerCase() });
            if (!customer) customer = await Customer.create({ nama: namaPemegang.trim(), email: emailPemegang.trim().toLowerCase() });
        } else {
            return res.status(400).json({ status: "error", message: "Sertakan customerId yang sudah ada, atau namaPemegang dan emailPemegang untuk membuat nasabah baru" });
        }

        const policy = await InsurancePolicy.create({
            nomorPolis: nomorPolis.trim(),
            customer: customer._id,
            jenis: jenis.trim().toLowerCase(),
            premiBulanan,
            tanggalMulai: tanggalMulai.trim(),
            pertanggungan: Array.isArray(pertanggungan) ? pertanggungan : []
        });
        await policy.populate("customer", "nama email nomorTelepon");
        return res.status(201).json({ status: "success", message: "Data polis berhasil ditambahkan", data: policy });
    } catch (err) { next(err); }
});

app.put("/insurance-policies/:id", cekApiKey, async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ status: "error", message: "ID polis tidak valid" });
        const body = req.body || {};
        const update = {};
        for (const key of ["nomorPolis", "jenis", "tanggalMulai"]) {
            if (body[key] !== undefined) {
                if (typeof body[key] !== "string" || !body[key].trim()) return res.status(400).json({ status: "error", message: `${key} harus berupa teks dan tidak boleh kosong` });
                update[key] = key === "jenis" ? body[key].trim().toLowerCase() : body[key].trim();
            }
        }
        if (body.premiBulanan !== undefined) {
            if (typeof body.premiBulanan !== "number" || !Number.isFinite(body.premiBulanan) || body.premiBulanan <= 0) return res.status(400).json({ status: "error", message: "premiBulanan harus angka > 0" });
            update.premiBulanan = body.premiBulanan;
        }
        if (body.pertanggungan !== undefined) {
            if (!Array.isArray(body.pertanggungan)) return res.status(400).json({ status: "error", message: "pertanggungan harus berupa array" });
            update.pertanggungan = body.pertanggungan;
        }
        if (body.customerId !== undefined) {
            if (!mongoose.isValidObjectId(body.customerId)) return res.status(400).json({ status: "error", message: "customerId tidak valid" });
            const customer = await Customer.findById(body.customerId);
            if (!customer) return res.status(400).json({ status: "error", message: "Nasabah tidak ditemukan" });
            update.customer = customer._id;
        }
        const policy = await InsurancePolicy.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate("customer", "nama email nomorTelepon");
        if (!policy) return res.status(404).json({ status: "error", message: "Data polis tidak ditemukan", data: null });
        return res.status(200).json({ status: "success", message: "Data polis berhasil diperbarui", data: policy });
    } catch (err) { next(err); }
});

app.delete("/insurance-policies/:id", cekApiKey, async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ status: "error", message: "ID polis tidak valid", data: null });
        const policy = await InsurancePolicy.findByIdAndDelete(req.params.id);
        if (!policy) return res.status(404).json({ status: "error", message: "Data polis tidak ditemukan", data: null });
        return res.status(200).json({ status: "success", message: "Data polis berhasil dihapus", data: null });
    } catch (err) { next(err); }
});

app.use((req, res) => res.status(404).json({ status: "error", message: "Endpoint tidak ditemukan", data: null }));
app.use(errorHandler);

if (require.main === module) {
    if (!MONGODB_URI) {
        console.error("MONGODB_URI belum diatur. Salin .env.example menjadi .env dan isi koneksi MongoDB.");
        process.exit(1);
    }
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log("Terhubung ke MongoDB");
            app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
        })
        .catch(err => {
            console.error("Gagal terhubung ke MongoDB:", err.message);
            process.exit(1);
        });
}

module.exports = app;
