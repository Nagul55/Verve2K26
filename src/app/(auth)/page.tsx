import React from 'react';
import { Metadata } from 'next';
import { LoginFormClient } from './LoginFormClient';

export const metadata: Metadata = {
  title: 'Eventrix | Sona College of Technology Event Management',
  description: 'Log in to Eventrix, the event management platform for Sona College of Technology.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Eventrix Login | Sona College of Technology',
    description: 'Log in to Eventrix, the event management platform for Sona College of Technology.',
    type: 'website',
  }
};

export default async function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Eventrix - Sona College of Technology',
    url: 'https://sona-eventrix-itads.vercel.app/',
    description: metadata.description
  };

  return (
    <div className="bg-gray-50 flex flex-col font-sans min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Login Section */}
      <LoginFormClient />
    </div>
  );
}
