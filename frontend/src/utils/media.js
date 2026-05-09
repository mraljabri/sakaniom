const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gUGhvdG88L3RleHQ+PC9zdmc+';

/**
 * Resolve a media src to a displayable URL.
 * - Cloudinary URLs are returned as-is (they start with https://)
 * - Local filenames (legacy / dev) are prefixed with /uploads/
 * - Falsy values return the placeholder
 */
export function mediaUrl(src, fallback = PLACEHOLDER) {
  if (!src) return fallback;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `/uploads/${src}`;
}

export { PLACEHOLDER };
