import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host')

  // Extraer el subdominio de cualquier dominio (localhost, vercel, etc.)
  const getSubdomain = (host: string | null): string | null => {
    if (!host) return null
    
    // En producción (Vercel): hydrarosario.rosario-hub.vercel.app -> hydrarosario
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
      const parts = host.split('.')
      // Si hay más de 2 partes, es un subdominio
      if (parts.length >= 2) {
        return parts[0]
      }
      return null
    }
    
    // En desarrollo: hydrarosario.localhost:3000 -> hydrarosario
    return host.replace(`.localhost:3000`, '')
  }
  
  const currentHost = getSubdomain(hostname)

  // Ignoramos rutas de la API, next/static, _next, favicon
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Si hay un subdominio y no es el dominio root ('www' o no hay subdominio)
  if (
    currentHost && 
    currentHost !== 'www' &&
    currentHost !== 'rosario-hub' &&
    currentHost !== 'localhost'
  ) {
    // Si la request es desde hydrarosario.rosario-hub.vercel.app
    // => La re-escribimos a /artist/hydrarosario
    console.log(`[Middleware] Rewriting subdomain: ${currentHost} -> /artist/${currentHost}`)
    return NextResponse.rewrite(new URL(`/artist/${currentHost}${url.pathname}`, req.url))
  }

  return NextResponse.next()
}
