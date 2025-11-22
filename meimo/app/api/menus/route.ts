import mongoose from "mongoose";
import { NextResponse } from "next/server";

// 1. KONEKSI DATABASE
const MONGO_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI tidak ditemukan di .env");
    }
    await mongoose.connect(MONGO_URI);
    console.log("✅ Berhasil connect ke MongoDB");
  } catch (error) {
    console.error("❌ Gagal connect DB:", error);
    throw new Error("Database connection failed");
  }
};

// 2. MODEL DATA (SCHEMA)
// tambahkan 'gambar' dan 'kategori' agar data tidak hilang
const MenuSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  harga: { type: Number, required: true },
  deskripsi: { type: String },
  kategori: { type: String }, // Tambahan: Supaya kategori (Main/Snack) terbaca
  gambar: { type: String }    // Tambahan: WAJIB ADA supaya gambar Cloudinary muncul
}, { strict: false }); // strict: false agar field lain di database tetap ikut terambil

// Cek model supaya tidak error "OverwriteModelError" saat reload
// Pastikan nama collection tetap "fkugd" sesuai database 
const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema, "fkugd");

// 3. API GET (Mengambil Semua Menu)
export async function GET() {
  try {
    await connectDB();
    
    // Ambil semua data menu
    const allMenus = await Menu.find({});
    
    return NextResponse.json(allMenus);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}