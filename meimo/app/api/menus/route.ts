// app/api/menus/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db"; // Pastikan path ini sesuai lokasi file db.ts
import Menu from "@/models/Menu";     // Pastikan path ini sesuai lokasi file Menu.ts

// 1. GET: Ambil Semua Menu (Untuk menampilkan list)
export async function GET() {
  try {
    await connectDB();
    const menus = await Menu.find().sort({ createdAt: -1 }); // Urutkan dari yang terbaru
    return NextResponse.json(menus);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data menu" }, { status: 500 });
  }
}

// 2. POST: Tambah Menu Baru (Untuk tombol Add)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validasi dasar
    if (!body.nama || !body.harga) {
      return NextResponse.json({ message: "Nama dan Harga wajib diisi" }, { status: 400 });
    }

    // Buat menu baru
    const newMenu = await Menu.create(body);
    
    return NextResponse.json({ message: "Menu berhasil dibuat", data: newMenu }, { status: 201 });
  } catch (error) {
    console.error("Error POST:", error);
    return NextResponse.json({ message: "Gagal menambahkan menu" }, { status: 500 });
  }
}

// 3. PUT: Edit Menu (Untuk tombol Save saat Edit)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ message: "ID tidak ditemukan" }, { status: 400 });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedMenu) {
      return NextResponse.json({ message: "Menu tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Menu berhasil diupdate", data: updatedMenu });
  } catch (error) {
    console.error("Error PUT:", error);
    return NextResponse.json({ message: "Gagal update menu" }, { status: 500 });
  }
}

// 4. DELETE: Hapus Menu (Untuk tombol Remove)
export async function DELETE(request: Request) {
  try {
    await connectDB();
    
    // Ambil ID dari URL (contoh: /api/menus?id=12345)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID diperlukan untuk menghapus" }, { status: 400 });
    }

    const deletedMenu = await Menu.findByIdAndDelete(id);

    if (!deletedMenu) {
      return NextResponse.json({ message: "Menu tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Menu berhasil dihapus" });
  } catch (error) {
    console.error("Error DELETE:", error);
    return NextResponse.json({ message: "Gagal menghapus menu" }, { status: 500 });
  }
}