import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // penting agar GET selalu realtime

//  POST – BUAT PESANAN BARU
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("meimo-resto");

    const order = {
      ...body,
      status: "pending",
      createdAt: new Date(),
    };

    const insert = await db.collection("orders").insertOne(order);

    return NextResponse.json(
      {
        success: true,
        message: "Order berhasil dibuat",
        id: insert.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error POST /orders:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}



//  GET – AMBIL ORDER + AUTO UPDATE > 15 DETIK
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("meimo-resto");

    // batas waktu 15 detik lalu
    const limit = new Date(Date.now() - 15 * 1000);

    // update semua pending yg >15 detik → completed
    await db.collection("orders").updateMany(
      {
        status: "pending",
        createdAt: { $lt: limit },
      },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
        },
      }
    );

    // ambil data terbaru
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Error GET /orders:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
