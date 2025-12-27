// YouTube utility functions

/**
 * Extract YouTube ID from URL
 * Supports:
 * - YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
 * - Regular YouTube: https://www.youtube.com/watch?v=VIDEO_ID
 * - Short URL: https://youtu.be/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Validate YouTube video ID format
 */
export function isValidYouTubeId(id: string): boolean {
  return /^[\w-]{11}$/.test(id);
}
