import React from 'react';
import Link from 'next/link';
import { getFests } from '@/actions/event.actions';
import { Metadata } from 'next';
import { Calendar, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Events & Hackathons',
  description: 'Discover upcoming events, symposiums, and hackathons at Sona College of Technology.',
  alternates: {
    canonical: '/explore',
  }
};

export default async function ExplorePage() {
  const allFests = await getFests();
  // Filter out drafts if they leak through
  const fests = allFests.filter(f => f.status === 'LIVE' || !f.status);

  const hackathons = fests.filter(f => f.event_type?.toLowerCase() === 'hackathon');
  const events = fests.filter(f => f.event_type?.toLowerCase() !== 'hackathon');

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Discover Sona Events</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore the latest hackathons, technical symposiums, and cultural fests at Sona College of Technology.
        </p>
      </div>

      {hackathons.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm">Upcoming Hackathons</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map(h => (
              <Link key={h.id} href={`/explore/hackathons/${h.id}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
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
                  <div className="flex items-center text-sm text-gray-500 gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-violet-600" />
                    <span>Closes {h.registration_closes_at ? new Date(h.registration_closes_at).toLocaleDateString() : 'TBA'}</span>
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
              <Link key={e.id} href={`/explore/events/${e.id}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
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
                  <div className="flex items-center text-sm text-gray-500 gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Closes {e.registration_closes_at ? new Date(e.registration_closes_at).toLocaleDateString() : 'TBA'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
