import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AeroFlow — Gestión centralizada de operaciones RPA",
  description:
    "Plataforma integral para planificación de misiones con drones, gestión de permisos DGAC, trazabilidad documental, control de flota y reportes operacionales. Cumplimiento normativo RPA.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
