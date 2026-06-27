import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { SessionWrapper } from "@/components/ui/session-wrapper";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToastProvider } from "@/lib/toast-context";
import { OperationalPanel } from "@/components/operational-panel";
import { getOperationalPanelData } from "@/server/operational-panel/queries";

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let panelData = null;
  try {
    panelData = await getOperationalPanelData();
  } catch {
    // panel stays hidden if data fetch fails
  }

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        style={{ color: "var(--text-primary)" }}
      >
        <ThemeProvider>
          <SessionWrapper>
            <ToastProvider>
              {children}
              {panelData && <OperationalPanel initialData={panelData} />}
            </ToastProvider>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
