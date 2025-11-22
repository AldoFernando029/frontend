"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

// 1. TIPE DATA
interface MenuItem {
  _id?: string;
  id?: string | number;
  nama?: string;
  name: string; // Field UI
  kategori: string;
  category?: string;
  harga?: number;
  price: number; // Field UI
  deskripsi?: string;
  description: string; // Field UI
  gambar?: string;
  imgSrc: string; // Field UI
  ratingStars?: string;
  history?: string;
  ingredients?: string;
  tips?: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

// 3. KOMPONEN UTAMA
export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk menu dari database
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [errorMenu, setErrorMenu] = useState<string>("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false); // State untuk Hamburger

  // Hitung Total
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Filter Menu berdasarkan Kategori & Search
  const filteredData = menuData.filter((item) => {
    const matchCategory = activeCategory === "Semua" || item.kategori === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Tambah ke Keranjang
  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, qty: c.qty + 1 } : c
        );
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  // Kurangi dari Keranjang
  const handleDecreaseQty = (id: string) => {
    setCartItems((prev) => 
      prev.map((item) => {
        if (item._id === id) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      }).filter((item) => item.qty > 0)
    );
  };

  
 
  // ✨ FETCH MENU DARI DATABASE (SEKALI SAJA SAAT LOAD)
 
  useEffect(() => {
    async function fetchMenuFromDB() {
      try {
        setLoadingMenu(true);
        // Panggil API Menu Internal
        const response = await fetch("/api/menus");

        if (!response.ok) {
          throw new Error("Gagal mengambil data menu");
        }

        const data = await response.json();

        // MAPPING DATA PENTING:
        const normalizedData = data.map((item: any) => ({
          _id: item._id,
          id: item._id, // Fallback id
          name: item.nama || item.name || 'Menu Tanpa Nama',
          kategori: item.kategori || item.category || 'Makanan Utama',
          price: item.harga || item.price || 0,
          description: item.deskripsi || item.description || '',
          imgSrc: item.gambar || item.imgSrc || '/images/placeholder.jpg',
          ratingStars: item.ratingStars || item.rating || '★★★★☆',
          history: item.history || item.sejarah || '',
          ingredients: item.ingredients || item.bahan || '',
          tips: item.tips || ''
        }));

        setMenuData(normalizedData);
        setErrorMenu("");
      } catch (error) {
        console.error("Error fetching menu:", error);
        setErrorMenu("Gagal memuat menu. Pastikan server berjalan.");
      } finally {
        setLoadingMenu(false);
      }
    }

    fetchMenuFromDB();
  }, []);


  // ✨ FUNGSI KIRIM PESANAN (POST KE MONGODB)

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuId: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty,
        })),
        total: totalPrice,
        status: "pending",
        createdAt: new Date()
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal mengirim pesanan");
      }

      const result = await response.json();
      console.log("Order Berhasil:", result);
      
      alert(`✅ Pesanan Berhasil Dibuat!\nID Order: ${result.id || 'Baru'}`);
      
      setCartItems([]);
      setShowCartModal(false);

    } catch (error: any) {
      console.error("Error saat konfirmasi:", error);
      alert(`❌ Gagal membuat pesanan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex bg-gradient min-vh-100 position-relative">
      
      {/* 🍔 TOMBOL HAMBURGER MOBILE (Responsif) */}
      <button 
        className="btn btn-light position-fixed top-0 start-0 m-3 shadow rounded-circle d-md-none"
        style={{ width: "50px", height: "50px", zIndex: 1050 }}
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
      >
        ☰
      </button>

      {/* SIDEBAR (Mobile Drawer) */}
      <aside className={`sidebar p-4 bg-white ${showMobileSidebar ? "d-flex" : "d-none"} d-md-flex flex-column`}>
        <div className="mb-5 d-flex justify-content-between align-items-center">
           <Link href="/" className="text-decoration-none d-flex align-items-center gap-3">
              <div className="logo-circle"><span className="fw-bold fs-3">M</span></div>
              <div><h4 className="m-0 fw-bold text-dark logo-text">MeimoResto</h4><small className="text-muted">Manado Authentic</small></div>
           </Link>
           {/* Tombol Tutup Mobile */}
           <button className="btn-close d-md-none" onClick={() => setShowMobileSidebar(false)}></button>
        </div>

        <div className="mb-4">
          <h6 className="text-muted text-uppercase small fw-bold mb-3 ls-1">📋 Kategori Menu</h6>
          <nav className="nav flex-column gap-2">
            {["Semua", "Makanan Utama", "Camilan", "Minuman", "Penutup"].map(cat => (
               <CategoryButton 
                  key={cat}
                  label={cat === "Semua" ? "Semua Menu" : cat}
                  icon={getIcon(cat)}
                  active={activeCategory === cat} 
                  onClick={() => { setActiveCategory(cat); setShowMobileSidebar(false); }}
               />
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <div className="cart-summary p-4 mb-3">
             <div className="d-flex justify-content-between mb-3 text-white">
                <span>Total:</span><span className="fw-bold fs-5">Rp {totalPrice.toLocaleString('id-ID')}</span>
             </div>
             <button 
               className="btn-cart w-100"
               onClick={() => { setShowCartModal(true); setShowMobileSidebar(false); }}
             >
               👀 Lihat Pesanan
             </button>
          </div>
          
          <Link href="/" className="btn-back w-100">← Kembali ke Home</Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow-1 p-4 main-content pt-5 pt-md-4"> 
        <header className="header-section mb-5">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="header-title mb-2">Mau makan apa hari ini? 🍽️</h1>
                <p className="header-subtitle">Temukan cita rasa otentik Manado favoritmu dengan sentuhan rumahan</p>
              </div>
              <div className="col-lg-6">
                <div className="d-flex gap-3 align-items-center justify-content-lg-end">
                   <div className="search-container">
                      <span className="search-icon">🔍</span>
                      <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Cari menu favorit..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <div className="user-avatar"><span>U</span></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Menu Grid */}
        {loadingMenu ? (
          <div className="loading-container">
            <div className="spinner-border text-warning" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-4 text-muted fw-medium">Memuat menu lezat untuk Anda...</p>
          </div>
        ) : errorMenu ? (
          <div className="alert alert-danger shadow-sm" role="alert">
            <strong>⚠️ Error:</strong> {errorMenu}
          </div>
        ) : (
          <div className="row g-4">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div key={item._id} className="col-12 col-md-6 col-xl-4">
                  <div className="menu-card">
                    <div className="menu-image-container">
                      <Image src={item.imgSrc} alt={item.name} fill style={{objectFit: "cover"}} className="menu-image"/>
                      <div className="menu-overlay"></div>
                      <span className="category-badge">{getIcon(item.kategori)} {item.kategori}</span>
                    </div>
                    <div className="menu-content">
                      <h5 className="menu-title">{item.name}</h5>
                      <p className="menu-description">{item.description?.substring(0, 80) || "Hidangan lezat khas Manado"}...</p>
                      <div className="menu-footer">
                        <div className="price-tag">
                          {item.price && item.price > 0 ? (
                            <>
                              <small className="text-muted d-block">Harga</small>
                              <span className="price">Rp {item.price.toLocaleString('id-ID')}</span>
                            </>
                          ) : (
                            <span className="text-danger">Harga tidak tersedia</span>
                          )}
                        </div>
                        <button onClick={() => handleAddToCart(item)} className="btn-order" disabled={!item.price}>+ Pesan</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12"><div className="empty-state"><div className="empty-icon">🍽️</div><h4 className="empty-title">Menu tidak ditemukan</h4></div></div>
            )}
          </div>
        )}
      </main>

      {/* MODAL KERANJANG */}
      {showCartModal && (
        <div className="modal fade show d-block modal-backdrop-custom" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content modal-custom">
              <div className="modal-header-custom">
                <div><h5 className="modal-title-custom"><span className="me-2">🛒</span>Keranjang Belanja</h5><small className="text-white-50">{totalItems} item dipilih</small></div>
                <button type="button" className="btn-close-custom" onClick={() => setShowCartModal(false)}>✕</button>
              </div>
              <div className="modal-body p-4">
                {cartItems.length === 0 ? (<div className="empty-cart"><h4>Keranjang Kosong</h4></div>) : (
                  <>
                    <div className="cart-items">
                      {cartItems.map((item) => (
                        <div key={item._id} className="cart-item">
                          <div className="cart-item-image"><Image src={item.imgSrc} alt={item.name} fill style={{objectFit: 'cover'}} /></div>
                          <div className="cart-item-details"><h6>{item.name}</h6><p>Rp {(item.price || 0).toLocaleString('id-ID')}</p></div>
                          <div className="cart-item-quantity">
                            <button className="qty-btn qty-btn-minus" onClick={() => handleDecreaseQty(String(item._id))} disabled={isLoading}>−</button>
                            <span className="qty-display">{item.qty}</span>
                            <button className="qty-btn qty-btn-plus" onClick={() => handleAddToCart(item)} disabled={isLoading}>+</button>
                          </div>
                          <div className="cart-item-subtotal">Rp {((item.price || 0) * item.qty).toLocaleString('id-ID')}</div>
                        </div>
                      ))}
                    </div>
                    <div className="cart-summary-box">
                      <div className="d-flex justify-content-between mb-2"><span className="text-muted">Subtotal</span><span className="fw-medium">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span className="text-muted">Pajak (10%)</span><span className="fw-medium">Rp {(totalPrice * 0.1).toLocaleString('id-ID')}</span></div>
                      <div className="divider my-3"></div>
                      <div className="d-flex justify-content-between align-items-center"><span className="fw-bold fs-5">Total Pembayaran</span><span className="total-price">Rp {(totalPrice * 1.1).toLocaleString('id-ID')}</span></div>
                    </div>
                  </>
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="modal-footer-custom">
                  <button className="btn-secondary-custom" onClick={() => setShowCartModal(false)} disabled={isLoading}>Lanjut Belanja</button>
                  <button className="btn-confirm-custom" onClick={handleConfirmOrder} disabled={isLoading}>
                    {isLoading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Memproses...</>) : (<><span className="me-2">✓</span>Konfirmasi Pesanan</>)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper Components & Functions ---
function getIcon(cat: string) {
  switch(cat) {
    case "Makanan Utama": return "🍲";
    case "Camilan": return "🥟";
    case "Minuman": return "🥤";
    case "Penutup": return "🍧";
    default: return "🍽️";
  }
}

function CategoryButton({ label, icon, active, onClick }: { label: string, icon: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`category-btn ${active ? 'active' : ''}`}
    >
      <span className="fs-5 me-3">{icon}</span>
      <span>{label}</span>
      {active && <span className="ms-auto">●</span>}
    </button>
  );
}