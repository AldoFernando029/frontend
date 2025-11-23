import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MONGO_URI = process.env.MONGODB_URI;

/**
 * Utility function to connect to MongoDB (or reuse cached connection).
 * Ensures connection is made to the specific 'meimo' database.
 * @returns {Promise<boolean>} True if connected, false otherwise (throws error if URI missing).
 */
const connectDB = async () => {
  // Check if connection is already ready (Mongoose caching)
  if (mongoose.connections[0].readyState) return true;
  
  if (!MONGO_URI) {
    console.error("❌ MONGODB_URI missing. Cannot connect to database.");
    throw new Error("MONGODB_URI not found.");
  }
  
  try {
    // Attempt to connect to the 'meimo' database
    await mongoose.connect(MONGO_URI, { dbName: "meimo" });
    return true;
  } catch (error) {
    console.error("❌ GAGAL Connect Database:", error);
    throw error;
  }
};



// 1. API GET (Untuk Admin melihat semua pesanan + AUTO-COMPLETE LOGIC)


export async function GET() {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
        // Jika gagal koneksi (misalnya MONGODB_URI missing), kirim balasan kosong
        return NextResponse.json([], { status: 200 }); 
    }

    // Akses Collection 'orders'
    const db = mongoose.connection.useDb("meimo");
    const collection = db.collection("orders");

    // --- LOGIKA AUTO-COMPLETE (LAZY UPDATE) ---
    const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000); // 15 detik yang lalu

    // Update semua order yang statusnya pending DAN dibuat lebih dari 15 detik yang lalu
    await collection.updateMany(
      {
        status: "pending",
        createdAt: { $lt: fifteenSecondsAgo } // $lt = Less Than (lebih tua dari)
      },
      {
        $set: { status: "completed" }
      }
    );
    // ------------------------------------------

    // Ambil semua data orders (terbaru di atas)
    const orders = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(orders);

  } catch (error: any) {
    console.error("🔥 GAGAL MENGAMBIL DATA ORDER:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// 2. API POST (Menerima Pesanan Baru)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isConnected = await connectDB();

    if (!isConnected) {
        // Jika DB setup gagal (misal: env var missing), kirim simulasi sukses
        return NextResponse.json({ message: "Order Success (Simulated)", id: "demo-id" }, { status: 201 });
    }

    // Sambungkan dan akses Collection 'orders'
    const db = mongoose.connection.useDb("meimo");
    const collection = db.collection("orders");

    // Lakukan Insert ke database
    const result = await collection.insertOne({
        ...body,
        status: "pending", // Status awal selalu pending
        createdAt: new Date() // Menyimpan waktu saat order dibuat
    });

    return NextResponse.json({ 
        message: "Order Berhasil!", 
        id: result.insertedId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("🔥 GAGAL SIMPAN ORDER:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}