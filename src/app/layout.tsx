import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eventrix",
  description: "Campus Events, Reimagined.",
  icons: {
    icon: "/assets/Eventrix logo.svg",
    shortcut: "/assets/Eventrix logo.svg",
    apple: "/assets/Eventrix logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-screen flex font-sans bg-eventrix-bg text-eventrix-black">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
