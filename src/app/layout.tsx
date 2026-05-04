import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

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
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-slate-50">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" richColors theme="system" />
      </body>
    </html>
  );
}
