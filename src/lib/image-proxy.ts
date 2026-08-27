export function getProxyImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('places.googleapis.com') || url.includes('maps.googleapis.com')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
