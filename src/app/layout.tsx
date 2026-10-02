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
  title: "EVENTRIX | Verve26",
  description: "Campus Events, Reimagined.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="h-screen overflow-hidden flex font-sans bg-eventrix-bg text-eventrix-black">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
