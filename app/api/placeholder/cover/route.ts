import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const color = (searchParams.get('color') || '1a3a6b').replace('#', '');
  const slug  = searchParams.get('slug') || 'event';

  // Derive initials from slug
  const words = slug.replace(/-/g, ' ').split(' ').filter(Boolean);
  const initials = words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const label = words.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#${color};stop-opacity:1"/>
        <stop offset="100%" style="stop-color:#${color};stop-opacity:0.7"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="400" fill="url(#g)"/>
    <text x="600" y="190" font-family="Arial,Helvetica,sans-serif" font-size="120" font-weight="900"
          fill="rgba(255,255,255,0.15)" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    <text x="600" y="290" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="600"
          fill="rgba(255,255,255,0.5)" text-anchor="middle">${label}</text>
    <text x="600" y="330" font-family="Arial,Helvetica,sans-serif" font-size="16"
          fill="rgba(255,255,255,0.3)" text-anchor="middle">crankmart.com</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
