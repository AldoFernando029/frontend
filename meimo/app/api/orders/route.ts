import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MONGO_URI = process.env.MONGODB_URI;

/*Fungsi koneksi database yang lebih sederhana dan anti-cache error.*/
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return true;
  
  if (!MONGO_URI) {
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


// 1. API GET (AUTO-COMPLETE LOGIC)

export async function GET() {
  try {
    const isConnected = await connectDB();
    if (!isConnected) return NextResponse.json([], { status: 200 }); 

    const db = mongoose.connection.useDb("meimo");
    const collection = db.collection("orders");

    // Logika Auto-Complete
    const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000);

    await collection.updateMany(
      { status: "pending", createdAt: { $lt: fifteenSecondsAgo } },
      { $set: { status: "completed" } }
    );

    // Ambil data terbaru
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
        return NextResponse.json({ message: "Order Success (Simulated)", id: "demo-id" }, { status: 201 });
    }

    const db = mongoose.connection.useDb("meimo");
    const collection = db.collection("orders");

    const result = await collection.insertOne({
        ...body,
        status: "pending", 
        createdAt: new Date()
    });

    return NextResponse.json({ 
        message: "Order Berhasil!", 
        id: result.insertedId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("🔥 GAGAL Simpan Order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}