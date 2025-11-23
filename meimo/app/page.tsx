"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";

interface Comment {
  name: string;
  text: string;
  date: string;
  rating?: number;
}

interface MenuItem {
  _id?: string;
  id?: number;
  name: string;
  nama?: string;
  imgSrc: string;
  gambar?: string;
  ratingStars?: string;
  description: string;
  deskripsi?: string;
  history?: string;
  kategori?: string;
  ingredients?: string;
  tips?: string;
  price?: number;
  harga?: number;
}

interface Background {
  _id?: string;
  nama: string;
  url: string;
  deskripsi?: string;
}

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

  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingMenu(true);

        const [menuRes, bgRes] = await Promise.all([
          fetch("/api/menus").catch(() => null),
          fetch("/api/backgrounds").catch(() => null),
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
              history: m.history || "",
              ingredients: m.ingredients || "",
              tips: m.tips || "",
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

  useEffect(() => {
    if (backgrounds.length === 0) return;
    const timer = setInterval(
      () => setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length),
      5000
    );
    return () => clearInterval(timer);
  }, [backgrounds]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("meimo_comments");
    if (stored) setComments(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (comments.length > 0)
      localStorage.setItem("meimo_comments", JSON.stringify(comments));
  }, [comments]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name =
      form.querySelector<HTMLInputElement>("#nama-user")?.value || "Anonim";
    const text =
      form.querySelector<HTMLTextAreaElement>("#isi-komentar")?.value.trim() || "";
    if (!text) return alert("Komentar tidak boleh kosong!");
    if (rating === 0) return alert("Silakan berikan rating terlebih dahulu!");
    const newComment: Comment = {
      name,
      text,
      date: new Date().toLocaleString("id-ID"),
      rating,
    };
    setComments((prev) => [newComment, ...prev]);
    form.reset();
    setRating(0);
  };

  const defaultBg =
    "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763014752/meimo1_s6uovk.jpg";
  const bgUrl =
    backgrounds.length > 0 && backgrounds[currentBgIndex]
      ? backgrounds[currentBgIndex].url
      : defaultBg;

  return (
    <div>
      <nav
        className={`navbar navbar-expand-lg fixed-top transition-all ${
          isScrolled ? "bg-white shadow-sm py-2" : "bg-transparent py-3"
        }`}
      >
        <div className="container">
          {/* BRAND */}
          <Link
            href="/"
            className="navbar-brand fw-bold d-flex align-items-center gap-2"
          >
            <span
              style={{
                color: isScrolled || isMobileMenuOpen ? "#333" : "#fff",
                fontFamily: "Playfair Display",
                fontSize: "1.5rem",
              }}
            >
              Meimo
            </span>
          </Link>

          {/* MOBILE TOGGLER */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: isScrolled || isMobileMenuOpen ? "#333" : "#fff" }}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>

          {/* MENU */}
          <div
            className={`collapse navbar-collapse ${
              isMobileMenuOpen ? "show bg-white p-3 rounded shadow mt-2" : ""
            }`}
          >
            {/* KIRI: MENU UTAMA */}
            <ul className="navbar-nav me-auto align-items-center gap-3">
              <li className="nav-item">
                <Link
                  href="/"
                  className="nav-link text-dark fw-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Beranda
                </Link>
              </li>

              <li className="nav-item">
                <a
                  href="#menu-gallery"
                  className="nav-link text-dark fw-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Menu
                </a>
              </li>
            </ul>

            {/* KANAN: LOGIN + PESAN */}
            <ul className="navbar-nav ms-auto align-items-center gap-3">
              <li className="nav-item">
                <Link
                  href="/login"
                  className="nav-link text-dark fw-medium"
                >
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  href="/order"
                  className="btn btn-warning rounded-pill px-4 fw-bold text-white shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dine In / Pesan
                </Link>
              </li>
            </ul>
          </div>
        </div>  {/* ← INI YANG KAMU LUPA */}
      </nav>


      <header
        className="hero-section"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
          minHeight: "100vh",
          paddingTop: "60px",
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

      <section id="menu-gallery" className="py-5 bg-dark text-white">
        <div className="container text-center mb-5">
          <h2>Galeri Menu Spesial</h2>
          <p>Klik gambar untuk melihat detail.</p>
        </div>

        <div className="horizontal-scroll-wrapper">
          {loadingMenu ? (
            <p className="text-center w-100">Memuat menu...</p>
          ) : (
            filteredMenu.map((menu) => (
              <div
                key={menu._id || menu.id || menu.name}
                className="scroll-card-item"
                onClick={() => {
                  setSelectedMenu(menu);
                  setShowModal(true);
                }}
              >
                <div className="card menu-card shadow">
                  <img
                    src={menu.imgSrc}
                    alt={menu.name}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                    }}
                    className="card-img-top"
                  />
                  <div className="card-body">
                    <h5>{menu.name}</h5>
                    <div className="text-warning fs-5 mb-2">
                      {menu.ratingStars}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {showModal && selectedMenu && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 overflow-hidden">
              <div className="modal-header bg-white border-0">
                <h3 className="modal-title fw-bold text-dark">
                  {selectedMenu.name}
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body p-0">
                <div className="row g-0">
                  <div className="col-lg-6">
                    <div style={{ height: "400px", position: "relative" }}>
                      <Image
                        src={selectedMenu.imgSrc}
                        alt={selectedMenu.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>

                  <div className="col-lg-6 p-4 p-lg-5 bg-light">
                    <h5 className="fw-bold text-primary mb-3">Deskripsi</h5>
                    <p className="text-muted">{selectedMenu.description}</p>

                    {selectedMenu.history && (
                      <>
                        <h5 className="fw-bold text-primary mb-2 mt-4">
                          Sejarah Hidangan
                        </h5>
                        <p className="text-muted small">{selectedMenu.history}</p>
                      </>
                    )}

                    {selectedMenu.ingredients && (
                      <>
                        <h5 className="fw-bold text-primary mb-2 mt-4">
                          Bahan Utama
                        </h5>
                        <p className="text-muted small">
                          {selectedMenu.ingredients}
                        </p>
                      </>
                    )}

                    <div className="mt-4 p-3 bg-white rounded shadow-sm border-start border-4 border-warning">
                      <strong>💡 Tips Chef:</strong> {selectedMenu.tips || "Nikmati selagi hangat."}
                    </div>

                    <div className="mt-5 pt-4 border-top">
                      <h6>Kirim Komentar</h6>
                      <form onSubmit={handleSubmit} className="mt-2">
                        <input
                          id="nama-user"
                          className="form-control mb-2"
                          placeholder="Nama Anda"
                          required
                        />
                        <textarea
                          id="isi-komentar"
                          className="form-control mb-2"
                          rows={2}
                          placeholder="Tulis komentar..."
                          required
                        ></textarea>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="rating-input">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                onClick={() => setRating(s)}
                                style={{
                                  cursor: "pointer",
                                  color: s <= rating ? "#ffc107" : "#ddd",
                                  fontSize: "1.5rem",
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm px-4"
                          >
                            Kirim
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer mt-5 pt-5 pb-3 border-top">
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
              <p>
                Baik pelanggan setia maupun pengunjung baru, kami berharap dapat
                melayani Anda dan berbagi hasrat kami untuk masakan lezat.
              </p>
            </div>

            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5>Jam Operasional</h5>
              <p>Setiap Hari: 10:00 - 22:00</p>
              <h5 className="mt-4">Alamat</h5>
              <p>
                Neo Soho Mall, Lantai 4<br />
                Jakarta Barat, Indonesia 11470
              </p>
            </div>

            <div className="col-lg-4">
              <h5>Hubungi Kami</h5>
              <p>
                <a href="tel:+6281234567890">+62 812 3456 7890</a> (Reservasi)
                <br />
                <a href="mailto:reservasi@meimo.com">
                  reservasi@meimo.com
                </a>
              </p>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success d-inline-flex align-items-center gap-2 px-4 py-2 mt-3 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.6 2.3A7.8 7.8 0 0 0 8 0 7.9 7.9 0 0 0 .1 7.9a7.8 7.8 0 0 0 1 4L0 16l4.2-1.1a8 8 0 0 0 3.8 1h.1a8 8 0 0 0 5.5-13.6zM8 14.5a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.2a6.6 6.6 0 1 1 5.6 3z" />
                </svg>
                WhatsApp Kami
              </a>
            </div>
          </div>

          <hr className="mt-5 mb-4" style={{ borderColor: "#444" }} />
          <p className="text-muted small mb-0 text-center">
            © {new Date().getFullYear()} Meimo Neo Soho. Semua hak cipta
            dilindungi.
          </p>
        </div>
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`btn btn-primary rounded-circle ${
          showScrollTop ? "show" : ""
        }`}
      >
        ↑
      </button>
    </div>
  );
}

