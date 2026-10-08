import React from 'react';
import { getFestById, getSubEvents } from '@/actions/event.actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Users, MapPin, Tag } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const fest = await getFestById(id);
  
  if (!fest) return { title: 'Event Not Found' };

  return {
    title: `${fest.name} | Sona College of Technology Events`,
    description: `Discover ${fest.name} at Sona College of Technology. View event dates, venue, details, rules and registration information. ${fest.description?.slice(0, 100)}...`,
    alternates: {
      canonical: `/explore/events/${id}`
    },
    openGraph: {
      title: `${fest.name} | Sona College of Technology Events`,
      description: fest.description?.slice(0, 200),
      images: fest.logo_url ? [fest.logo_url] : [],
      type: 'website'
    }
  };
}

export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fest = await getFestById(id);

  if (!fest || fest.event_type?.toLowerCase() === 'hackathon') {
    notFound();
  }

  const subEvents = await getSubEvents(id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: fest.name,
    description: fest.description,
    image: fest.logo_url ? [fest.logo_url] : undefined,
    startDate: fest.registration_closes_at ? new Date(fest.registration_closes_at).toISOString() : undefined,
    location: {
      '@type': 'Place',
      name: 'Sona College of Technology',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Salem',
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN'
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'Eventrix - Sona College of Technology',
      url: 'https://sona-eventrix-itads.vercel.app'
    }
  };

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {fest.logo_url && (
          <div className="w-full h-64 md:h-96 relative bg-gray-100">
            <img src={fest.logo_url} alt={fest.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-8 md:p-12 space-y-6">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">{fest.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
            {fest.registration_closes_at && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar className="w-4 h-4 text-violet-600" />
                Reg. Closes {new Date(fest.registration_closes_at).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <MapPin className="w-4 h-4 text-violet-600" />
              Sona College of Technology
            </div>
          </div>
          
          <div className="prose prose-violet max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{fest.description}</p>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <Link href="/signup" className="inline-flex items-center justify-center bg-violet-700 hover:bg-violet-800 text-white font-bold py-3.5 px-8 rounded-xl transition shadow-sm">
              Register Now to Participate
            </Link>
          </div>
        </div>
      </div>

      {subEvents && subEvents.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Competitions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {subEvents.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-900">{event.name}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${event.event_type === 'TECHNICAL' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {event.event_type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Team Size: {event.min_team_size}-{event.max_team_size}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {event.venue || 'TBA'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
