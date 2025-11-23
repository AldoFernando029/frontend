// FILE: lib/mongodb.ts (FINAL Mongoose Caching Fix)
import mongoose from "mongoose";

// Ambil URI dari Environment Variable
const uri: string = process.env.MONGODB_URI!;
// Database name yang sudah kita konfirmasi
const DB_NAME = "meimo"; 

if (!uri) {
  throw new Error("❌ MONGODB_URI belum di-set di Environment Variables");
}

// ⚠️ PERBAIKAN: Definisi Tipe Global untuk Caching
// Kita simpan koneksi (conn) dan promise (promise)
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Fungsi utilitas untuk menghubungkan/mengambil koneksi Mongoose yang sudah di-cache.
 */
async function dbConnect() {
  if (cached.conn) {
    // Jika koneksi sudah ada di cache, langsung kembalikan
    return cached.conn;
  }
  
  if (!cached.promise) {
    const opts = {
      dbName: DB_NAME,
      bufferCommands: false,
    };
    
    // Cache the promise for connection
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log("✅ New Mongoose connection established.");
      return mongoose;
    });
  }
  
  // Tunggu promise selesai dan simpan di conn
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;