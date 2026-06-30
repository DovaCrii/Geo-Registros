import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SessionWrapper } from "@/components/ui/session-wrapper";
import { ToastProvider } from "@/lib/toast-context";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AeroFlow | Plataforma geoespacial para vuelos, georegistro e informes técnicos",
  description:
    "AeroFlow centraliza vuelos, georegistros, modelos 2D/3D, ortomosaicos, nubes de puntos, entregables y reportes técnicos para ingeniería, minería, topografía e infraestructura.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        style={{ color: "var(--text-primary)" }}
      >
        <ThemeProvider>
          <SessionWrapper>
            <ToastProvider>{children}</ToastProvider>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
