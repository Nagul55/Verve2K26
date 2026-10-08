import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sona-eventrix-itads.vercel.app';

  // Note: All other pages are either authenticated/private or explicitly excluded 
  // login/register routes per requirements. We only include the root canonical domain.
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1.0,
    }
  ];
}
