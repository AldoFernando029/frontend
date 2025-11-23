import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // GET selalu realtime

// POST — BUAT ORDER BARU

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

    const insertResult = await db.collection("orders").insertOne(order);

    return NextResponse.json(
      {
        success: true,
        message: "Order berhasil dibuat",
        id: insertResult.insertedId,
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


// GET — LIST ORDER + AUTO UPDATE > 15 DETIK
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("meimo-resto");

    // waktu 15 detik lalu
    const limit = new Date(Date.now() - 15 * 1000);

    // AUTO COMPLETE: semua pending > 15 detik → completed
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

    // Ambil semua order
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("❌ Error GET /orders:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
