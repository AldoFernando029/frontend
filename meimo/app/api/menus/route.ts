import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MONGODB_URI = process.env.MONGODB_URI;

/*Fungsi koneksi database yang lebih sederhana dan anti-cache error */
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return true;
  
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not found.");
  }
  
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "meimo" });
    return true;
  } catch (error) {
    console.error("❌ GAGAL Connect Database:", error);
    throw error;
  }
};


export async function GET() {
  
  try {
    await connectDB(); // Panggil fungsi koneksi di awal
    
    // Ambil Data Langsung (Tanpa Schema)
    const db = mongoose.connection.useDb("meimo");
    const rawData = await db.collection("menus").find({}).toArray();

    if (rawData.length === 0) {
        return NextResponse.json({ 
            message: "Koneksi Berhasil, tapi Collection 'menus' kosong." 
        }, { status: 200 }); 
    }

    return NextResponse.json(rawData);

  } catch (error: any) {
    console.error("❌ Database Error:", error.message);
    return NextResponse.json({ 
        error: "Gagal mengambil data dari Database", 
        details: error.message 
    }, { status: 500 });
  }
}