import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Rasa Manado",
  description: "Halaman login untuk website Rasa Manado",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}
