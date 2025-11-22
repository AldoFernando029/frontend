import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const MONGO_URI = process.env.MONGODB_URI;

  try {
    // 1. Cek Koneksi DB
    if (!MONGO_URI) {

        console.log("MONGODB_URI missing, order simulasi sukses.");
        return NextResponse.json({ message: "Simulasi Order Sukses (DB belum connect)", id: "demo-123" }, { status: 201 });
    }

    // 2. Koneksi ke Database 'meimo'
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGO_URI, { dbName: "meimo" });
    }

    // 3. Ambil Data dari Frontend
    const body = await req.json();

    // 4. Simpan ke Collection 'orders'
    const db = mongoose.connection.useDb("meimo");
    const collection = db.collection("orders");

    const result = await collection.insertOne({
        ...body,
        createdAt: new Date()
    });

    return NextResponse.json({ 
        message: "Order Berhasil Disimpan!", 
        id: result.insertedId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Gagal Simpan Order:", error);
    // Jangan return error 500, return 200 tapi kasih pesan gagal biar gak crash JSON-nya
    return NextResponse.json({ message: "Order diterima (Mode Offline)", error: error.message }, { status: 200 });
  }
}