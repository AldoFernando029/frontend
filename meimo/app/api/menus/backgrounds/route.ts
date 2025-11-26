import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    return NextResponse.json({ error: "MONGODB_URI belum disetting!" }, { status: 500 });
  }

  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGO_URI);
    }

    // Akses langsung ke database 'meimo', collection 'backgrounds'
    const db = mongoose.connection.useDb("meimo");
    const rawData = await db.collection("backgrounds").find({}).toArray();

    return NextResponse.json(rawData);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}