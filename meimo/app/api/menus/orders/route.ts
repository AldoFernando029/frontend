import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const MONGO_URI = process.env.MONGODB_URI;

  if (!MONGO_URI) {
    return NextResponse.json({ error: "MONGODB_URI belum disetting!" }, { status: 500 });
  }

  try {
    // 1. Ambil Data dari Frontend
    const body = await req.json();

    // 2. Koneksi ke Database 'meimo' (TEKNIK PAKSA)
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGO_URI, { dbName: "meimo" });
    }

    // 3. Akses Langsung Collection 'orders'
    const db = mongoose.connection.useDb("meimo");
    const collection = db.collection("orders");

    // 4. Masukkan Data (Insert)
    const result = await collection.insertOne({
        ...body,
        createdAt: new Date() // Tambah waktu server
    });

    console.log("Order berhasil disimpan:", result.insertedId);

    return NextResponse.json({ 
        message: "Order Berhasil!", 
        id: result.insertedId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Gagal Simpan Order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}