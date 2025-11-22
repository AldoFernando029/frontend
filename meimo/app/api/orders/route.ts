import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: "API Orders Siap!" });
}

export async function POST(req: Request) {
  const MONGO_URI = process.env.MONGODB_URI;

  try {
    const body = await req.json();

    if (!MONGO_URI) {
      return NextResponse.json({ message: "Simulasi Sukses (No DB)", id: "demo" }, { status: 201 });
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGO_URI, { dbName: "meimo" });
    }

    const db = mongoose.connection.useDb("meimo");
    const result = await db.collection("orders").insertOne({
      ...body,
      createdAt: new Date()
    });

    return NextResponse.json({ message: "Order Sukses", id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}