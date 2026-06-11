import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BOMCOSTING — Báo giá nhựa ép khuôn",
  description: "Hệ thống tính BOM và báo giá chi tiết nhựa ép khuôn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
