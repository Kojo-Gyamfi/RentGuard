import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RentGuard | Digital Rental Management",
  description: "RentGuard brings transparency, fairness, and efficiency to Ghana's rental housing market.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className={`${outfit.className} min-h-full flex flex-col text-slate-900 bg-slate-50`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
