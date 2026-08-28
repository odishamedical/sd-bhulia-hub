import { MetadataRoute } from 'next'
import { getAllApprovedProfiles } from '@/lib/server-db';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bhulia.com';
  
  // 1. Static Core Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/register-weaver`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/register-store`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/register-franchise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/directory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // 2. Fetch all profiles from REST Bypass
  const profiles = await getAllApprovedProfiles();
  
  // 3. Generate Individual Profile Routes
  const profileRoutes: MetadataRoute.Sitemap = profiles.filter(p => p.slug).map(profile => {
    let routePrefix = 'store';
    if (profile.role === 'weaver') routePrefix = 'weaver';
    if (profile.role === 'wholesaler') routePrefix = 'wholesaler';
    if (profile.role === 'raw_material') routePrefix = 'supplier';
    
    return {
      url: `${baseUrl}/${routePrefix}/${profile.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  // 4. Generate 5-Tier Geo-Routes
  const geoSet = new Set<string>();
  
  profiles.forEach(profile => {
    const rawState = profile.state || profile.address?.split(',')?.[2]?.trim() || "Odisha";
    const rawDistrict = profile.district || profile.address?.split(',')?.[1]?.trim();
    const rawBlock = profile.block || profile.address?.split(',')?.[0]?.trim();
    
    if (rawDistrict) {
      const state = encodeURIComponent(rawState.toLowerCase().replace(/ /g, '-'));
      const district = encodeURIComponent(rawDistrict.toLowerCase().replace(/ /g, '-'));
      
      // District Level: /sambalpuri-saree-in-bargarh-odisha
      geoSet.add(`${baseUrl}/sambalpuri-saree-in-${district}-${state}`);
      
      if (rawBlock) {
        const block = encodeURIComponent(rawBlock.toLowerCase().replace(/ /g, '-'));
        // Block Level: /sambalpuri-saree-in-bijepur-bargarh-odisha
        geoSet.add(`${baseUrl}/sambalpuri-saree-in-${block}-${district}-${state}`);
      }
    }
  });

  const geoRoutes: MetadataRoute.Sitemap = Array.from(geoSet).map(url => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticRoutes, ...profileRoutes, ...geoRoutes];
}
