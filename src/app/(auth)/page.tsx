import React from 'react';
import { Metadata } from 'next';
import { getFests } from '@/actions/event.actions';
import { Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { LoginFormClient } from './LoginFormClient';

export const metadata: Metadata = {
  title: 'Eventrix | Sona College of Technology Events & Hackathons',
  description: 'Discover events, technical symposiums, workshops, hackathons and cultural fests at Sona College of Technology with Eventrix.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Eventrix | Sona College of Technology Events & Hackathons',
    description: 'Discover events, technical symposiums, workshops, hackathons and cultural fests at Sona College of Technology with Eventrix.',
    type: 'website',
  }
};

export default async function HomePage() {
  const allFests = await getFests();
  // Filter out drafts if they leak through
  const fests = allFests.filter(f => f.status === 'LIVE' || !f.status);

  const hackathons = fests.filter(f => f.event_type?.toLowerCase() === 'hackathon');
  const events = fests.filter(f => f.event_type?.toLowerCase() !== 'hackathon');

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
      
      {/* Original Hero / Login Section */}
      <LoginFormClient />

      {/* SEO Discovery Layer */}
      <main id="events-section" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Eventrix: Sona College of Technology Events & Hackathons
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Welcome to Eventrix. Explore our upcoming hackathons, technical symposiums, workshops, and cultural fests. Browse event details, check registration deadlines, and participate to showcase your technical and creative skills.
          </p>
        </div>

        {hackathons.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm">Upcoming Hackathons</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map(h => (
                <Link key={h.id} href={`/hackathons/${h.id}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {h.logo_url ? (
                      <img src={h.logo_url} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl">{h.name[0]}</div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-violet-700 shadow-sm">Hackathon</div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{h.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{h.description}</p>
                    <div className="flex flex-col gap-2 mt-4 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-violet-600" />
                        <span>{h.hackathons?.[0]?.hackathon_starts_at ? new Date(h.hackathons[0].hackathon_starts_at).toLocaleDateString() : 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-600" />
                        <span>{h.hackathons?.[0]?.venue || 'Sona College of Technology'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {(!h.registration_closes_at || new Date(h.registration_closes_at) > new Date()) ? (
                          <span className="text-green-600">Registrations Open</span>
                        ) : (
                          <span className="text-red-500">Registrations Closed</span>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Featured Events</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(e => (
                <Link key={e.id} href={`/events/${e.id}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {e.logo_url ? (
                      <img src={e.logo_url} alt={e.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl">{e.name[0]}</div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{e.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{e.description}</p>
                    <div className="flex flex-col gap-2 mt-4 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{e.registration_closes_at ? `Reg. Closes: ${new Date(e.registration_closes_at).toLocaleDateString()}` : 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>Sona College of Technology</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {(!e.registration_closes_at || new Date(e.registration_closes_at) > new Date()) ? (
                          <span className="text-green-600">Registrations Open</span>
                        ) : (
                          <span className="text-red-500">Registrations Closed</span>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 font-medium">&copy; {new Date().getFullYear()} Sona College of Technology. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
