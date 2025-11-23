import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Rasa Manado",
  description: "Halaman login untuk website Rasa Manado",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden", 
        }}
      >
        {children}
      </body>
    </html>
  );
}
