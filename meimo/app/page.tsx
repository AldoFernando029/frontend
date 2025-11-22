"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import "bootstrap/dist/css/bootstrap.min.css"; // JANGAN HAPUS

// ... (Interface Comment, MenuItem, Background tetap sama) ...
interface Comment { name: string; text: string; date: string; rating?: number; }
interface MenuItem { _id?: string; id?: number; name: string; nama?: string; imgSrc: string; gambar?: string; ratingStars?: string; description: string; deskripsi?: string; history?: string; kategori?: string; ingredients?: string; tips?: string; price?: number; harga?: number; }
interface Background { _id?: string; nama: string; url: string; deskripsi?: string; }


export default function Home() {
  const router = useRouter();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // LOGIC NAVIGASI MOBILE DIHAPUS DARI SINI
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // FETCH DATA
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingMenu(true);
        const [menuRes, bgRes] = await Promise.all([
          fetch("/api/menus").catch(() => null),
          fetch("/api/backgrounds").catch(() => null)
        ]);

        let menuData: any[] = [];
        let bgData: any[] = [];

        if (menuRes && menuRes.ok) menuData = await menuRes.json();
        if (bgRes && bgRes.ok) bgData = await bgRes.json();

        if (Array.isArray(bgData) && bgData.length > 0) setBackgrounds(bgData);

        if (Array.isArray(menuData) && menuData.length > 0) {
          setFilteredMenu(
            menuData.map((m: any) => ({
              ...m,
              name: m.nama || m.name || "Tanpa Nama",
              imgSrc: m.gambar || m.imgSrc || "/images/placeholder.jpg",
              description: m.deskripsi || m.description || "",
              ratingStars: "★★★★☆",
              price: m.harga || m.price || 0,
            }))
          );
        }
      } catch (err) {
        console.error("❌ Error fetching:", err);
      } finally {
        setLoadingMenu(false);
      }
    }
    fetchData();
  }, []);

  // SLIDESHOW (Ditinggalkan agar tetap dinamis)
  useEffect(() => {
    if (backgrounds.length === 0) return;
    const timer = setInterval(
      () => setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length),
      5000
    );
    return () => clearInterval(timer);
  }, [backgrounds]);

  // SCROLL LOGIC DIHAPUS (karena memicu error)
  // LocalStorage Comments (dibiarkan)
  useEffect(() => {
    const stored = localStorage.getItem("meimo_comments");
    if (stored) setComments(JSON.parse(stored));
  }, []);
  useEffect(() => {
    if (comments.length > 0)
      localStorage.setItem("meimo_comments", JSON.stringify(comments));
  }, [comments]);
  
  // Komentar & Search (Ditinggalkan)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => { /* ... */ };
  const handleSearch = (e: FormEvent<HTMLFormElement>) => { /* ... */ };


  const defaultBg = "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763014752/meimo1_s6uovk.jpg";
  
  const bgUrl =
    backgrounds.length > 0 && backgrounds[currentBgIndex]
      ? backgrounds[currentBgIndex].url
      : defaultBg;

  return (
    <div>
      {/* --- NAVBAR RESPONSIVE BARU (Paling atas) --- */}
      <nav className={`navbar navbar-expand-lg fixed-top py-3 bg-dark text-white`}>
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold d-flex align-items-center gap-2 text-white">
               Rasa Manado
          </Link>
          <button 
            className="navbar-toggler border-0 shadow-none text-white" 
            type="button" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>

          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? "show bg-dark p-3 rounded shadow mt-2" : ""}`}>
            <ul className="navbar-nav ms-auto align-items-center gap-3">
              <li className="nav-item"><Link href="/" className="nav-link text-white fw-medium">Beranda</Link></li>
              <li className="nav-item"><a href="#menu-gallery" className="nav-link text-white fw-medium">Menu</a></li>
              <li className="nav-item"><Link href="/admin" className="nav-link text-white fw-medium">Admin</Link></li>
              <li className="nav-item">
                <Link href="/order" className="btn btn-warning rounded-pill px-4 fw-bold text-white shadow-sm">
                  Dine In / Pesan
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* --- AKHIR NAVBAR --- */}

      {/* HERO */}
      <header
        className="hero-section"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
          minHeight: "100vh", 
          paddingTop: "60px"
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content text-center text-white">
            <span className="script-text">Rasa</span>
            <h1>MANADO</h1>
            <p className="lead fs-4">
              Jelajahi cita rasa khas Manado dan kisah di baliknya.
            </p>
          </div>
        </div>
      </header>

      {/* MENU GALLERY */}
      <section id="menu-gallery" className="py-5 bg-dark text-white">
        <div className="container text-center mb-5">
          <h2>Galeri Menu Spesial</h2>
          <p>Klik gambar untuk melihat detail.</p>
        </div>
        <div className="horizontal-scroll-wrapper">
          {loadingMenu ? (
             <p className="text-center w-100">Memuat menu...</p>
          ) : filteredMenu.map((menu) => (
            <div
              key={menu._id || Math.random()}
              className="scroll-card-item"
              onClick={() => { setSelectedMenu(menu); setShowModal(true); }}
            >
              <div className="card menu-card shadow">
                <img
                  src={menu.imgSrc}
                  alt={menu.name}
                  style={{ width: "100%", height: "300px", objectFit: "cover" }}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5>{menu.name}</h5>
                  <div className="text-warning fs-5 mb-2">{menu.ratingStars}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL DETAIL MENU (Dipersingkat) */}
      {showModal && selectedMenu && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }} tabIndex={-1}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header bg-white border-0">
                <h3 className="modal-title fw-bold text-dark">{selectedMenu.name}</h3>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                 {/* Detail Menu... */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & SCROLL TOP BUTTON (Disatukan) */}
      <footer className="footer mt-5 pt-5 pb-3 bg-white text-dark border-top">
        <div className="container">
          <div className="mb-5">
            <h5 className="mb-3 text-center">Lokasi Kami</h5>
            <div className="ratio ratio-21x9">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.712454356452!2d106.78726097499202!3d-6.174721693801916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f70002bcd3f9%3A0xcf51c0e1b63aedf4!2sMeimo%20Masakan%20Manado%20Neo%20Soho!5e0!3m2!1sid!2sid!4v1730989000000!5m2!1sid!2sid"
                style={{ border: 0, borderRadius: "0.5rem" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Meimo di Jakarta"
              ></iframe>
            </div>
          </div>

          <div className="row text-start mt-5">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5 className="footer-brand-title fw-bold">Meimo</h5>
              <p>Baik pelanggan setia maupun pengunjung baru, kami berharap dapat melayani Anda dan berbagi hasrat kami untuk masakan lezat.</p>
            </div>
            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5>Jam Operasional</h5>
              <p>Setiap Hari: 10:00 - 22:00</p>
              <h5 className="mt-4">Alamat</h5>
              <p>Neo Soho Mall, Lantai 4<br />Jakarta Barat, Indonesia 11470</p>
            </div>
            <div className="col-lg-4">
              <h5>Hubungi Kami</h5>
              <p>
                <a href="tel:+6281234567890">+62 812 3456 7890</a> (Reservasi)<br />
                <a href="mailto:reservasi@meimo.com">reservasi@meimo.com</a>
              </p>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success d-inline-flex align-items-center gap-2 px-4 py-2 mt-3 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.6 2.3A7.8 7.8 0 0 0 8 0 7.9 7.9 0 0 0 .1 7.9a7.8 7.8 0 0 0 1 4L0 16l4.2-1.1a8 8 0 0 0 3.8 1h.1a8 8 0 0 0 5.5-13.6zM8 14.5a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.2a6.6 6.6 0 1 1 5.6 3z" />
                </svg>
                WhatsApp Kami
              </a>
            </div>
          </div>

          <hr className="mt-5 mb-4" style={{ borderColor: "#eee" }} />
          <p className="text-muted small mb-0 text-center">
            © {new Date().getFullYear()} Meimo Neo Soho. Semua hak cipta dilindungi.
          </p>
        </div>
      </footer>

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`btn btn-primary rounded-circle scroll-to-top ${
          showScrollTop ? "show" : ""
        }`}
      >
        ↑
      </button>
    </div>
  );
}