import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Pastikan selalu fresh, tidak di-cache
export const dynamic = 'force-dynamic';

const MONGO_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  if (!MONGO_URI) {
    throw new Error("MONGODB_URI tidak ditemukan di Environment Variables!");
  }
  try {
    // Opsi dbName memaksa koneksi ke database 'meimo'
    await mongoose.connect(MONGO_URI, { dbName: "meimo" });
    console.log("✅ Berhasil Connect ke MongoDB Database: meimo");
  } catch (error) {
    console.error("❌ Gagal Connect Database:", error);
    throw error;
  }
};

// Schema longgar (strict: false) supaya bisa baca field 'nama', 'name', 'gambar', 'imgSrc' sekaligus
const MenuSchema = new mongoose.Schema({}, { strict: false });

const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema, "menus");

export async function GET() {
  try {
    await connectDB();
    
    // Ambil semua data dari collection 'menus'
    const allMenus = await Menu.find({});
    
    // Cek di Log Vercel berapa data yang ditemukan
    console.log(` Ditemukan ${allMenus.length} menu dari database 'meimo'.`);

    // Kirim data murni dari database
    return NextResponse.json(allMenus);

  } catch (error: any) {
    console.error(" API Error:", error.message);
    return NextResponse.json({ error: "Gagal ambil data dari DB", details: error.message }, { status: 500 });
  }
}