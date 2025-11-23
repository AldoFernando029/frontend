"use client";

import { usePathname } from "next/navigation";
import React from 'react'; // Diperlukan untuk React.ReactNode

// FIX: Tambahkan tipe eksplisit { children: React.ReactNode }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/order" ||
    pathname === "/meimo/order";

  return (
    <html lang="en">
      <body>
        {!hideNavbar && (
          <div></div> 
        )}
        {children}
      </body>
    </html>
  );
}