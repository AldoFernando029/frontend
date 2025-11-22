import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// 1. FUNGSI GET (Cek status API)
export async function GET() {
  return NextResponse.json({ message: "API Orders Siap! (Jalur benar)" });
}

// 2. FUNGSI POST (Terima Pesanan)
export async function POST(req: Request) {
  const MONGO_URI = process.env.MONGODB_URI;

  try {
    const body = await req.json();

    // Cek Koneksi DB
    if (!MONGO_URI) {
      console.log("⚠️ MONGODB_URI missing, masuk mode simulasi.");
      return NextResponse.json({ message: "Order Berhasil (Simulasi)", id: "demo-id" }, { status: 201 });
    }

    // Connect ke MongoDB
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGO_URI, { dbName: "meimo" });
    }

    const db = mongoose.connection.useDb("meimo");
    const collection = db.collection("orders");

    // Simpan Data
    const result = await collection.insertOne({
      ...body,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      message: "Order Berhasil Disimpan!", 
      id: result.insertedId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("🔥 Error Backend:", error);
    return NextResponse.json({ error: "Gagal memproses order", detail: error.message }, { status: 500 });
  }
}