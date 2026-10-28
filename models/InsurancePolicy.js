const mongoose = require("mongoose");

// Embedded schema: detail pertanggungan menjadi bagian dari dokumen polis.
const pertanggunganSchema = new mongoose.Schema({
    nama: { type: String, required: true, trim: true },
    batasManfaat: { type: Number, required: true, min: 0 },
    keterangan: { type: String, default: "", trim: true }
}, { _id: false });

// Referencing: field customer menunjuk dokumen pada collection Customer.
const insurancePolicySchema = new mongoose.Schema({
    nomorPolis: { type: String, required: true, unique: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    jenis: { type: String, required: true, lowercase: true, trim: true, enum: ["kesehatan", "jiwa", "kendaraan", "properti", "perjalanan"] },
    premiBulanan: { type: Number, required: true, min: 0.01 },
    tanggalMulai: { type: String, required: true, trim: true },
    pertanggungan: { type: [pertanggunganSchema], default: [] }
}, { timestamps: true });

insurancePolicySchema.index({ jenis: 1, premiBulanan: 1 });
insurancePolicySchema.index({ tanggalMulai: -1 });

module.exports = mongoose.model("InsurancePolicy", insurancePolicySchema);
