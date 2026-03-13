import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host') || ''

  const getSubdomain = (host: string): string | null => {
    // Handle production
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
      const parts = host.split('.')
      if (parts.length >= 2) {
        return parts[0]
      }
      return null
    }

    // Handle development: hydrarosario.localhost:3000 -> hydrarosario
    // localhost:3000 -> null (main domain)
    
    // Check if it's exactly localhost or 127.0.0.1 (main domain)
    if (host === 'localhost:3000' || host === '127.0.0.1:3000' || 
        host === 'localhost' || host === '127.0.0.1') {
      return null
    }

    // Otherwise, extract subdomain
    const subdomain = host.split('.')[0]
    if (subdomain && subdomain !== 'www') {
      return subdomain
    }
    
    return null
  }

  const subdomain = getSubdomain(hostname)

  // Skip API and static paths
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // If we have a subdomain (like hydrarosario), rewrite to /artist/[slug]
  if (subdomain) {
    const targetPath = url.pathname === '/' ? '' : url.pathname
    return NextResponse.rewrite(new URL(`/artist/${subdomain}${targetPath}`, req.url))
  }

  // Main domain: allow all routes normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
