import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export const dynamic = "force-dynamic";

// POST — SIMPAN ORDER
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, error: "Format items tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("meimo-resto");

    const order = {
      items: body.items,
      total: body.total || 0,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    return NextResponse.json(
      { success: true, message: "Pesanan berhasil dibuat", id: result.insertedId },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("❌ Error POST /orders:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}



// GET — LIST & AUTO COMPLETE
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("meimo-resto");

    // Tentukan batas 15 detik
    const timeout = new Date(Date.now() - 15 * 1000);

    // AUTO COMPLETE — semua pending lebih dari 15 detik
    await db.collection("orders").updateMany(
      {
        status: "pending",
        createdAt: { $lt: timeout },
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

  } catch (err: any) {
    console.error("❌ Error GET /orders:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
