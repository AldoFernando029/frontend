import mongoose, { Schema, model, models } from "mongoose";

const MenuSchema = new Schema(
  {
    nama: { type: String, required: true },
    kategori: { type: String, required: true },
    harga: { type: Number, required: true },
    biaya: { type: Number, default: 0 },
    stok: { type: Number, default: 0 },
    deskripsi: { type: String },
    gambar: { type: String },
    ratingStars: { type: String, default: "★★★★☆" },
    history: { type: String },
    ingredients: { type: String },
    tips: { type: String },
  },
  { timestamps: true }
);

const Menu = models.Menu || model("Menu", MenuSchema);

export default Menu;