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
  metadataBase: new URL("https://sona-eventrix-itads.vercel.app"),
  title: {
    default: "Eventrix | Sona College of Technology Events & Hackathons",
    template: "%s | Eventrix"
  },
  description: "Eventrix is the premier event management and discovery platform for Sona College of Technology. Register for college events, hackathons, and technical symposiums.",
  keywords: ["Eventrix", "Sona College of Technology", "Hackathons", "College Events", "Sona Events", "Symposium"],
  authors: [{ name: "Sona College of Technology" }],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/assets/Eventrix logo.svg",
    shortcut: "/assets/Eventrix logo.svg",
    apple: "/assets/Eventrix logo.svg",
  },
  openGraph: {
    title: "Eventrix | Sona College of Technology Events & Hackathons",
    description: "Eventrix is the premier event management and discovery platform for Sona College of Technology. Register for college events, hackathons, and technical symposiums.",
    url: "https://sona-eventrix-itads.vercel.app/",
    siteName: "Eventrix",
    images: [
      {
        url: "/images/mobile-hero-bg.webp",
        width: 1200,
        height: 630,
        alt: "Eventrix - Sona College of Technology",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventrix | Sona College of Technology Events & Hackathons",
    description: "Eventrix is the premier event management and discovery platform for Sona College of Technology. Register for college events, hackathons, and technical symposiums.",
    images: ["/images/mobile-hero-bg.webp"],
  },
  verification: {
    google: "1O0m3AY-JB-lyRDOybaUYDqgnXv3nEKT9C2Ok78LtLY",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
