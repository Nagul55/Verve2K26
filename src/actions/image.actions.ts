"use server";

import { unstable_cache } from "next/cache";

export const getUnsplashImage = unstable_cache(
  async (query: string): Promise<string | null> => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!accessKey) {
      console.warn("UNSPLASH_ACCESS_KEY is missing. Falling back to a placeholder.");
      return null;
    }

    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
        // We can still pass revalidate here to instruct fetch
        next: { revalidate: 86400 } 
      });

      if (!res.ok) {
        console.error("Unsplash API Error:", await res.text());
        return null;
      }

      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular; // Return the image URL
      }
      
      return null;
    } catch (error) {
      console.error("Failed to fetch image from Unsplash:", error);
      return null;
    }
  },
  ['unsplash-images'],
  { revalidate: 86400 * 30 } // Cache for 30 days essentially
);
