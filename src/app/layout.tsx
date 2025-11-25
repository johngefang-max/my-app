import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import LoginModal from "./components/LoginModal";
import { Layout } from "@/components/Layout";
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
  title: "3D Model Preview Platform",
  description: "Professional 3D model preview and editing platform with AI generation capabilities",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("language")?.value;
  const initialLanguage = langCookie === "zh" ? "zh" : "en";
  return (
    <html lang={initialLanguage}>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <Providers>
            <Layout>
              {children}
            </Layout>
          </Providers>
            <LoginModal />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
