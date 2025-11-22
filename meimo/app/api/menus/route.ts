import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Wajib: Agar data selalu fresh
export const dynamic = 'force-dynamic';

export async function GET() {
  const MONGO_URI = process.env.MONGODB_URI;

  // 1. Cek Kunci Jawaban (Environment Variable)
  if (!MONGO_URI) {
    return NextResponse.json({ error: "FATAL: MONGODB_URI belum disetting di Vercel!" }, { status: 500 });
  }

  try {
    // 2. Koneksi ke Server
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGO_URI);
    }

    // 3. AKSES LANGSUNG (Tanpa Schema/Model)
    // Ini intinya: "Pindah ke database 'meimo', lalu buka collection 'menus'"
    const db = mongoose.connection.useDb("meimo");
    const rawData = await db.collection("menus").find({}).toArray();

    console.log(` Berhasil ambil ${rawData.length} menu dari database asli.`);

    // 4. Kirim Data Asli
    return NextResponse.json(rawData);

  } catch (error: any) {
    console.error(" Database Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}