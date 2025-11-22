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

// 2. MODEL DATA
const MenuSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  harga: { type: Number, required: true },
  deskripsi: { type: String }
});

// Cek model supaya tidak error saat reload
const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema, "fkugd");

// 3. API GET (INI YANG TADI HILANG)
export async function GET() {
  try {
    await connectDB();
    const allMenus = await Menu.find();
    return NextResponse.json(allMenus);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}