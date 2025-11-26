"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, logoutUser, getCurrentUser } from "@/utils/auth";

interface User {
  name: string;
  email: string;
}

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 🔥 UPDATE: Menggunakan array includes dan handling trailing slash agar lebih aman
  const hideNavbar = [
    "/order", 
    "/meimo/order", 
    "/login"
  ].includes(pathname || "");

  // Jika di halaman login/order, komponen ini berhenti render di sini.
  if (hideNavbar) return null;

  // Function to update auth state
  const updateAuthState = () => {
    const authStatus = isLoggedIn();
    setLoggedIn(authStatus);

    if (authStatus) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    updateAuthState();

    const handleAuthChange = () => updateAuthState();
    window.addEventListener('authChange', handleAuthChange);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rasamanado_token' || e.key === 'rasamanado_user') {
        updateAuthState();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const interval = setInterval(updateAuthState, 2000);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    router.push("/");
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${isScrolled ? 'bg-dark scrolled' : 'bg-transparent'}`} style={{ zIndex: 1030 }}>
      <div className="container">

        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-3 text-warning" href="/">
          Rasa Manado
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link text-white" href="/">Beranda</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/#menu-gallery">Menu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/#brand">Tentang</Link>
            </li>
          </ul>

          {/* Auth + Order */}
          <div className="d-flex align-items-center" style={{ gap: '1.5rem' }}>
            {loggedIn ? (
              <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                <span className="text-white d-none d-md-block">
                  Halo, <strong>{user?.name || "User"}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light"
                  style={{ minWidth: "100px" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn btn-outline-light" style={{ minWidth: "100px" }}>
                Login
              </Link>
            )}

            <button
              onClick={() => router.push("/order")}
              className="btn btn-warning fw-bold text-dark px-4"
              style={{
                borderRadius: "25px",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              🍽 Dine In / Pesan
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}