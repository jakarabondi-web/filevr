import type { Metadata } from "next";
import { Inter, Anton, Bebas_Neue, Archivo_Black } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Three display-face candidates powering the theme picker (data-theme
// switches which one --font-display points to; see globals.css).
const anton = Anton({
  variable: "--font-display-acid",
  weight: "400",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display-terracotta",
  weight: "400",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display-cobalt",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Filevr — Files in. Finished work out.",
  description:
    "Convert, compress, sign, merge, OCR, and edit documents from one workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} ${bebasNeue.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
