import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import LoginModal from "./components/LoginModal";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "imageto3d - AI Image to 3D Model Generator",
  description: "Transform your images into stunning 3D models with AI. Upload any image and get high-quality 3D models in seconds. Perfect for creators, designers, and developers.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("language")?.value;
  const nextLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const selected = (langCookie || nextLocale) === "zh" ? "zh" : "en";
  return (
    <html lang={selected}>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Providers>
          <AuthProvider>
            <LanguageProvider initialLanguage={selected}>
              <Header />
              {children}
              <Footer />
              <LoginModal />
            </LanguageProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
