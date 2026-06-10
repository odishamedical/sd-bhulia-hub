/**
 * Extracts the video ID from various forms of YouTube URLs.
 * Supports:
 * - youtu.be/ID
 * - youtube.com/watch?v=ID
 * - youtube.com/shorts/ID
 * - youtube.com/embed/ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  } else {
    return null;
  }
}

/**
 * Returns a secure, embeddable YouTube URL for iframes.
 * Features: rel=0 (no related videos at the end), muted=1, autoplay=1 (optional)
 */
export function getYouTubeEmbedUrl(url: string, autoPlay: boolean = false): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  let embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
  if (autoPlay) {
    embedUrl += "&autoplay=1&mute=1";
  }
  return embedUrl;
}
