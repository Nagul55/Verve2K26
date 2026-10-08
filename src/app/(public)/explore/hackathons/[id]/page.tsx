import React from 'react';
import { getFestById } from '@/actions/event.actions';
import { getHackathon } from '@/actions/hackathon.actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Users, MapPin, Trophy, Target, Award } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const fest = await getFestById(id);
  const hackathon = await getHackathon(id);
  
  if (!fest || !hackathon) return { title: 'Hackathon Not Found' };

  return {
    title: `${fest.name} - Sona Tech Hackathon | Eventrix`,
    description: `Participate in ${fest.name} at Sona College of Technology. Compete for prizes, showcase your skills, and solve real-world problems. ${fest.description?.slice(0, 100)}...`,
    alternates: {
      canonical: `/explore/hackathons/${id}`
    },
    openGraph: {
      title: `${fest.name} - Sona Tech Hackathon | Eventrix`,
      description: fest.description?.slice(0, 200),
      images: fest.logo_url ? [fest.logo_url] : [],
      type: 'website'
    }
  };
}

export default async function PublicHackathonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fest = await getFestById(id);
  const hackathon = await getHackathon(id);

  if (!fest || !hackathon || fest.event_type?.toLowerCase() !== 'hackathon') {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: fest.name,
    description: fest.description,
    image: fest.logo_url ? [fest.logo_url] : undefined,
    startDate: hackathon.hackathon_starts_at ? new Date(hackathon.hackathon_starts_at).toISOString() : undefined,
    endDate: hackathon.hackathon_ends_at ? new Date(hackathon.hackathon_ends_at).toISOString() : undefined,
    location: {
      '@type': 'Place',
      name: hackathon.venue || 'Sona College of Technology',
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
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            {hackathon.hackathon_mode || 'Hackathon'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">{fest.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
            {hackathon.hackathon_starts_at && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar className="w-4 h-4 text-violet-600" />
                {new Date(hackathon.hackathon_starts_at).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <MapPin className="w-4 h-4 text-violet-600" />
              {hackathon.venue || 'Sona College of Technology'}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <Users className="w-4 h-4 text-violet-600" />
              Team Size: {hackathon.minimum_team_size}-{hackathon.maximum_team_size}
            </div>
          </div>
          
          <div className="prose prose-violet max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{fest.description}</p>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <Link href="/signup" className="inline-flex items-center justify-center bg-violet-700 hover:bg-violet-800 text-white font-bold py-3.5 px-8 rounded-xl transition shadow-sm w-full sm:w-auto text-center">
              Register Team
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {hackathon.problem_statement_description && (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Target className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold text-gray-900">Theme / Challenge</h2>
            </div>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>{hackathon.problem_statement_description}</p>
            </div>
          </div>
        )}

        {(hackathon.prize_1st || hackathon.prize_2nd) && (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl"><Trophy className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold text-gray-900">Prizes</h2>
            </div>
            <ul className="space-y-4">
              {hackathon.prize_1st && (
                <li className="flex items-center gap-4 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100">
                  <span className="text-2xl font-black text-yellow-500">1st</span>
                  <span className="font-semibold text-gray-900">{hackathon.prize_1st}</span>
                </li>
              )}
              {hackathon.prize_2nd && (
                <li className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-2xl font-black text-gray-400">2nd</span>
                  <span className="font-semibold text-gray-900">{hackathon.prize_2nd}</span>
                </li>
              )}
              {hackathon.prize_3rd && (
                <li className="flex items-center gap-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                  <span className="text-2xl font-black text-orange-400">3rd</span>
                  <span className="font-semibold text-gray-900">{hackathon.prize_3rd}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {(hackathon.rules || hackathon.judging_criteria) && (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Award className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-gray-900">Rules & Guidelines</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {hackathon.rules && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">General Rules</h3>
                <div className="text-gray-600 text-sm whitespace-pre-line">{hackathon.rules}</div>
              </div>
            )}
            {hackathon.judging_criteria && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Judging Criteria</h3>
                <div className="text-gray-600 text-sm whitespace-pre-line">{hackathon.judging_criteria}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
