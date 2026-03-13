import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host')

  const getSubdomain = (host: string | null): string | null => {
    if (!host) return null
    
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
      const parts = host.split('.')
      if (parts.length >= 2) {
        return parts[0]
      }
      return null
    }
    
    return host.replace(`.localhost:3000`, '')
  }
  
  const currentHost = getSubdomain(hostname)

  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/factory') ||
    url.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  if (
    currentHost && 
    currentHost !== 'www' &&
    currentHost !== 'rosario-hub' &&
    currentHost !== 'localhost'
  ) {
    return NextResponse.rewrite(new URL(`/artist/${currentHost}${url.pathname}`, req.url))
  }

  return NextResponse.next()
}
