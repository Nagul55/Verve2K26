import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/explore" className="flex items-center gap-3">
            <Image src="/assets/Eventrix logo.svg" alt="Eventrix" width={120} height={40} className="h-8 w-auto" />
            <span className="font-anton text-2xl text-violet-700 tracking-wider hidden sm:block pt-1">EVENTRIX</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/explore" className="text-sm font-semibold text-gray-600 hover:text-violet-700 transition">Discover</Link>
            <Link href="/signup" className="text-sm font-bold text-white bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-lg transition shadow-sm">Sign Up</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 font-medium">&copy; {new Date().getFullYear()} Sona College of Technology. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
