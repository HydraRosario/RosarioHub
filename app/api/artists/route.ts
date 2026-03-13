import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Ruta donde guardaremos nuestro "backend" sin base de datos externa
const dataFilePath = path.join(process.cwd(), 'data.json')

// Helper para leer los datos
const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    // Si no existe, lo creamos con algunos datos de muestra
    const initialData = [
      {
        id: '1',
        name: 'HydraRosario',
        slug: 'hydrarosario',
        email: 'hydra@rosariohub.com',
        status: 'active',
        theme: 'SOFT_TRAP',
        metrics: {
          spotify_listeners: 25000,
          youtube_subs: 1700,
          instagram_followers: 8500,
          relevance_score: 45
        },
        created_at: new Date().toISOString()
      }
    ]
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2))
    return initialData
  }
  const fileData = fs.readFileSync(dataFilePath, 'utf-8')
  return JSON.parse(fileData)
}

// Helper para escribir
const writeData = (data: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
}

// GET: Para traer todos los artistas
export async function GET() {
  const data = readData()
  return NextResponse.json(data)
}

// POST: Para crear un nuevo artista
export async function POST(request: Request) {
  const newArtistData = await request.json()
  const data = readData()
  
  const newArtist = {
    ...newArtistData,
    id: Date.now().toString(),
    status: 'pending',
    metrics: {
      spotify_listeners: 0,
      youtube_subs: 0,
      instagram_followers: 0,
      relevance_score: 0
    },
    created_at: new Date().toISOString()
  }

  data.push(newArtist)
  writeData(data)

  return NextResponse.json(newArtist)
}
