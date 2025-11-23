import mongoose from "mongoose";
import { NextResponse } from "next/server";
// Import utilitas koneksi dari lib/mongodb.ts

import dbConnect from "../../../lib/mongodb"; 

export const dynamic = 'force-dynamic';


// API GET (Untuk mengambil semua data Menu)

export async function GET() {
  
  try {
    // 1. Panggil utilitas koneksi yang di-cache
    // Ini akan terhubung atau menggunakan koneksi yang sudah ada (caching)
    await dbConnect(); 

    // 2. Ambil Data Langsung (Tanpa Schema)
    // Akses database 'meimo' yang sudah terhubung melalui Mongoose
    const db = mongoose.connection.useDb("meimo");
    
    // Pastikan nama collection 'menus'
    const rawData = await db.collection("menus").find({}).toArray();

    // console.log(` Data ditemukan: ${rawData.length} item`); // Opsional log

    if (rawData.length === 0) {
        return NextResponse.json({ 
            message: "Koneksi Berhasil, tapi Collection 'menus' kosong." 
        }, { status: 200 }); // Tetap 200 agar frontend tidak error
    }

    // 3. Kirim Data Asli
    return NextResponse.json(rawData);

  } catch (error: any) {
    // dbConnect sudah menangani error jika MONGODB_URI missing.
    console.error("❌ Database Error:", error.message);
    return NextResponse.json({ 
        error: "Gagal mengambil data dari Database", 
        details: error.message 
    }, { status: 500 });
  }
}