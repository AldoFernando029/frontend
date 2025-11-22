import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Wajib: Agar Vercel selalu cek data baru (tidak cache)
export const dynamic = 'force-dynamic';

const MONGO_URI = process.env.MONGODB_URI;

export async function GET() {
  try {
    // 1. Cek Environment Variable
    if (!MONGO_URI) {
      return NextResponse.json({ error: "MONGODB_URI tidak ditemukan di Vercel Settings" }, { status: 500 });
    }

    // 2. Koneksi Database (Paksa ke database 'meimo')
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGO_URI, { 
        dbName: "meimo"  // paksa masuk ke database meimo
      });
      console.log("✅ Terkoneksi ke MongoDB");
    }

    // 3. AMBIL DATA LANGSUNG (Tanpa Schema Model)
    // gunakan native driver untuk langsung comot data dari collection 'menus'
    // Ini menghindari masalah salah nama model/schema di Mongoose
    const db = mongoose.connection.useDb("meimo"); 
    const collection = db.collection("menus");
    
    const allMenus = await collection.find({}).toArray();

    // 4. Cek Hasil
    console.log(`📊 Ditemukan ${allMenus.length} menu.`);
    
    // Kalau kosong, kasih pesan error biar tau
    if (allMenus.length === 0) {
        return NextResponse.json([], { status: 200 }); // Kembalikan array kosong, bukan error
    }

    return NextResponse.json(allMenus);

  } catch (error: any) {
    console.error("🔥 Error:", error.message);
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}