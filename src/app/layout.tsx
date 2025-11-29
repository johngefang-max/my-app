import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import LoginModal from "./components/LoginModal";
import Header from "./components/Header";
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
        <Providers>
          <AuthProvider>
            <LanguageProvider initialLanguage={initialLanguage}>
              <Header />
              {children}
              <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                  <div className="text-gray-400 text-sm">© 2024 AI3D Pro</div>
                  <div className="flex space-x-6">
                    <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
                    <a href="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
                    <a href="/pricing" className="text-gray-400 hover:text-white text-sm">Pricing</a>
                  </div>
                </div>
              </footer>
              <LoginModal />
            </LanguageProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
