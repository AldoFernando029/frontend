import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const MONGO_URI = process.env.MONGODB_URI;

  // 1. Cek apakah Password DB ada
  if (!MONGO_URI) {
    console.error("ERROR: MONGODB_URI tidak ditemukan di Vercel!");
    return NextResponse.json({ 
      error: "Konfigurasi Server Belum Lengkap (MONGODB_URI Missing)" 
    }, { status: 500 });
  }

  try {
    // 2. Koneksi ke Database 'meimo'
    if (!mongoose.connections[0].readyState) {
      console.log(" Mencoba connect ke MongoDB...");
      await mongoose.connect(MONGO_URI, { dbName: "meimo" });
      console.log(" Berhasil Connect!");
    }

    // 3. Ambil Data Langsung (Tanpa Schema)
    const db = mongoose.connection.useDb("meimo");
    // Pastikan nama collection 'menus' (sesuai screenshot Atlas)
    const rawData = await db.collection("menus").find({}).toArray();

    console.log(` Data ditemukan: ${rawData.length} item`);

    if (rawData.length === 0) {
        return NextResponse.json({ 
            message: "Koneksi Berhasil, tapi Collection 'menus' kosong." 
        }, { status: 200 }); // Tetap 200 biar frontend tidak error, tapi kosong
    }

    // 4. Kirim Data Asli
    return NextResponse.json(rawData);

  } catch (error: any) {
    console.error(" Database Error:", error.message);
    return NextResponse.json({ 
        error: "Gagal mengambil data dari Database", 
        details: error.message 
    }, { status: 500 });
  }
}