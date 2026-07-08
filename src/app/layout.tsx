import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "illusione",
  description: "Plataforma inmobiliaria premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${outfit.className} bg-stone-50 text-stone-900 antialiased font-light selection:bg-stone-900 selection:text-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
