import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Pastikan data selalu fresh, tidak dicache

// 1. KONEKSI DATABASE
const MONGO_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  if (!MONGO_URI) {
    throw new Error("MONGODB_URI tidak ditemukan di Environment Variables Vercel!");
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ BERHASIL Connect ke MongoDB");
  } catch (error) {
    console.error("❌ GAGAL Connect Database:", error);
    throw error;
  }
};

// 2. MODEL DATA
// Gunakan strict: false agar apapun data yang ada di DB terambil (termasuk gambar/imgSrc/dll)
const MenuSchema = new mongoose.Schema({}, { strict: false });

//  PENTING: "fkugd" adalah nama collection yang BENAR di MongoDB Atlas.
// Jika nama collection kamu 'menus', ganti "fkugd" jadi "menus" di baris bawah ini.
const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema, "fkugd");

// 3. API GET
export async function GET() {
  try {
    await connectDB();
    
    // Ambil semua data
    const allMenus = await Menu.find({});
    
    console.log(` Ditemukan ${allMenus.length} menu dari database.`);

    if (allMenus.length === 0) {
        // Jika array kosong, berarti salah nama collection atau DB kosong
        return NextResponse.json({ message: "Koneksi Berhasil, tapi Data Kosong. Cek nama collection." }, { status: 404 });
    }
    
    return NextResponse.json(allMenus);

  } catch (error: any) {
    console.error(" API Error:", error.message);
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}