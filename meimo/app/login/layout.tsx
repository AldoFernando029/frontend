"use client";

import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/order" ||
    pathname === "/meimo/order";

  return (
    <html lang="en">
      <body>
        {!hideNavbar && (
          <Navbar />
        )}
        {children}
      </body>
    </html>
  );
}
