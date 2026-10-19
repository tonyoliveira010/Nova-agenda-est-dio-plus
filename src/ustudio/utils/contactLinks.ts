export function safeLink(value: string) {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''; } catch { return ''; }
}
export function mapEmbed(value: string) {
  try {
    const url = new URL(value);
    if (!/(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.hostname !== 'maps.google.com') return '';
    if (url.pathname.startsWith('/maps/embed')) return url.href;
    const coordinates = url.pathname.match(/@(-?[\d.]+),(-?[\d.]+)/);
    const query = url.searchParams.get('q') || url.searchParams.get('query') || (coordinates ? `${coordinates[1]},${coordinates[2]}` : '');
    return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : '';
  } catch { return ''; }
}