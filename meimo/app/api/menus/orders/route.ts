import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MONGO_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!MONGO_URI) throw new Error("MONGODB_URI missing");
  // Paksa connect ke database 'meimo'
  await mongoose.connect(MONGO_URI, { dbName: "meimo" });
};

// Schema Order
const OrderSchema = new mongoose.Schema({
  items: Array,
  total: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

// Pastikan nama collection 'orders'
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema, "orders");

// API POST (Untuk Menerima Pesanan Baru)
export async function POST(req: Request) {
  try {
    await connectDB();
    
    // Ambil data yang dikirim dari frontend
    const body = await req.json();
    
    // Buat object order baru
    const newOrder = new Order(body);
    
    // Simpan ke MongoDB
    await newOrder.save();
    
    return NextResponse.json({ message: "Order Berhasil Disimpan!", order: newOrder }, { status: 201 });

  } catch (error: any) {
    console.error(" Gagal Simpan Order:", error);
    return NextResponse.json({ error: "Gagal menyimpan pesanan" }, { status: 500 });
  }
}