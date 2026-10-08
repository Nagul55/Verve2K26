import { MetadataRoute } from 'next';
import { getFests } from '@/actions/event.actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sona-eventrix-itads.vercel.app';

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    }
  ];

  try {
    // Dynamically fetch all public/live events/fests using admin client bypass
    const allFests = await getFests();
    const fests = allFests.filter(f => f.status === 'LIVE' || !f.status);

    for (const fest of fests) {
      const isHackathon = fest.event_type?.toLowerCase() === 'hackathon';
      const path = isHackathon ? `/hackathons/${fest.id}` : `/events/${fest.id}`;
      
      routes.push({
        url: `${baseUrl}${path}`,
        lastModified: fest.created_at ? new Date(fest.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("Error generating sitemap dynamically:", err);
  }

  return routes;
}
