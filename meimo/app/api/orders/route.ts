import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const db = (await clientPromise).db("meimo-resto");
    const body = await req.json();

    // Tambahkan timestamp & status pending
    const order = {
      ...body,
      status: "pending",
      createdAt: new Date()
    };

    const insertResult = await db.collection("orders").insertOne(order);
    const insertedId = insertResult.insertedId;

    // ================
    // AUTO COMPLETE 15 DETIK
    // ================
    setTimeout(async () => {
      try {
        await db.collection("orders").updateOne(
          { _id: insertedId },
          { $set: { status: "completed", completedAt: new Date() } }
        );
        console.log("Order auto-completed:", insertedId);
      } catch (err) {
        console.error("Gagal auto-complete pesanan:", err);
      }
    }, 15000); // 15 detik
    // =================

    return NextResponse.json({
      success: true,
      message: "Order berhasil dibuat",
      id: insertedId,
    });

  } catch (error) {
    console.error("Error membuat order:", error);
    return NextResponse.json(
      { success: false, error },
      { status: 500 }
    );
  }
}
