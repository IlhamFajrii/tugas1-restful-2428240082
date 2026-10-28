const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    nama: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nomorTelepon: { type: String, default: "", trim: true },
    alamat: { type: String, default: "", trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
