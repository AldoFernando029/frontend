import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Fungsi Koneksi Database
const connectDB = async () => {
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) return false;
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(MONGO_URI, { dbName: "meimo" });
  }
  return true;
};


// 1. API GET (Diakses Admin/User untuk melihat status)

export async function GET() {
  try {
    const isConnected = await connectDB();
    if (!isConnected) return NextResponse.json([], { status: 200 });

    const db = mongoose.connection.useDb("meimo");
    const collection = db.collection("orders");

    // --- LOGIKA OTOMATIS COMPLETE ---
    // 1. Tentukan waktu 15 detik yang lalu
    const timeLimit = new Date(Date.now() - 15 * 1000); // 15000 ms

    // 2. Cari semua order yang statusnya "pending" DAN dibuat sebelum 15 detik lalu
    // Lalu update statusnya jadi "completed" secara otomatis
    await collection.updateMany(
      { 
        status: "pending", 
        createdAt: { $lt: timeLimit } // $lt = Less Than (Lebih tua dari waktu batas)
      },
      { 
        $set: { status: "completed" } 
      }
    );
    // -----------------------------------------------------

    // 3. Ambil data terbaru (yang sudah terupdate statusnya)
    const orders = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(orders);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. API POST (Menerima Pesanan Baru)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isConnected = await connectDB();

    if (!isConnected) {
        return NextResponse.json({ message: "Simulasi (DB Off)", id: "demo" }, { status: 201 });
    }

    const db = mongoose.connection.useDb("meimo");
    const result = await db.collection("orders").insertOne({
        ...body,
        status: "pending", // Awal masuk pasti pending
        createdAt: new Date()
    });

    return NextResponse.json({ message: "Order Sukses", id: result.insertedId }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}