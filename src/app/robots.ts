import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/*',
        '/coordinator/*',
        '/dashboard/*',
        '/settings/*',
        '/tickets/*',
        '/events/*',
        '/hackathons/*',
        '/registrations/*',
        '/certificates/*',
        '/api/*',
      ],
    },
    sitemap: 'https://sona-eventrix-itads.vercel.app/sitemap.xml',
  };
}
