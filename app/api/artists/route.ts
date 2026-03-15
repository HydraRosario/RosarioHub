import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Ruta donde guardaremos nuestro "backend" sin base de datos externa
const dataFilePath = path.join(process.cwd(), 'data.json')

// Fallback data para cuando el filesystem no está disponible (Vercel serverless)
const FALLBACK_DATA = [
  {
    id: '1',
    name: 'HydraRosario',
    slug: 'hydrarosario',
    email: 'hydra@rosariohub.com',
    status: 'active',
    theme: 'SOFT_TRAP',
    metrics: {
      spotify_monthly_listeners: 25000,
      youtube_subs: 1700,
      instagram_followers: 8500,
      relevance_score: 45
    },
    created_at: '2026-03-13T01:53:14.165Z'
  }
]

// Helper para leer los datos
const readData = () => {
  // En Vercel serverless, el filesystem es de solo lectura o efímero
  // Intentar leer pero si falla, usar fallback
  try {
    if (!fs.existsSync(dataFilePath)) {
      console.log('[API] data.json not found, using fallback data')
      return FALLBACK_DATA
    }
    const fileData = fs.readFileSync(dataFilePath, 'utf-8')
    const parsed = JSON.parse(fileData)
    return Array.isArray(parsed) ? parsed : FALLBACK_DATA
  } catch (error) {
    console.error('[API] Error reading data.json, using fallback:', error)
    return FALLBACK_DATA
  }
}

// Helper para escribir (solo funciona en desarrollo local)
const writeData = (data: any) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('[API] Error writing to data.json (may not be available in Vercel):', error)
    return false
  }
}

// GET: Para traer todos los artistas
export async function GET() {
  const data = readData()
  return NextResponse.json(data)
}

// POST: Para crear un nuevo artista
export async function POST(request: Request) {
  // En Vercel serverless, no podemos escribir al filesystem
  // Retornar un error indicando que esta función no está disponible en producción
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Create artist not available in production. Use local development mode.' },
      { status: 503 }
    )
  }
  
  const newArtistData = await request.json()
  const data = readData()
  
  const newArtist = {
    ...newArtistData,
    id: Date.now().toString(),
    status: 'pending',
    metrics: {
      spotify_monthly_listeners: 0,
      youtube_subs: 0,
      instagram_followers: 0,
      relevance_score: 0
    },
    created_at: new Date().toISOString()
  }

  data.push(newArtist)
  const success = writeData(data)

  if (!success) {
    return NextResponse.json(
      { error: 'Could not save artist. Filesystem not available.' },
      { status: 500 }
    )
  }

  return NextResponse.json(newArtist)
}
