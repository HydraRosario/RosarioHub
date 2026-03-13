import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host')

  // Obtener el dominio base de variables de entorno o usar hardcodes
  // Ej: artisthub.com en producción, localhost:3000 en local
  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname?.replace('.artisthub.com', '')
      : hostname?.replace(`.localhost:3000`, '')

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
    currentHost !== 'localhost:3000' && 
    currentHost !== 'artisthub.com' &&
    currentHost !== 'www'
  ) {
    // Si la request es desde hydrarosario.localhost:3000
    // => La re-escribimos a /artist/hydrarosario
    return NextResponse.rewrite(new URL(`/artist/${currentHost}${url.pathname}`, req.url))
  }

  return NextResponse.next()
}
