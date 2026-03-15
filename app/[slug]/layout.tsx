import { Artist } from '../factory/types'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data.json')

const readData = () => {
    try {
        if (!fs.existsSync(dataFilePath)) return []
        return JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
    } catch {
        return []
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const artists: Artist[] = readData()
    const artist = artists.find(a => a.slug === slug)
    
    if (!artist) {
        return {
            title: 'RosarioHub - Artista no encontrado'
        }
    }
    
    const totalFollowers = 
        (artist.metrics?.youtube_subs || 0) +
        (artist.metrics?.spotify_monthly_listeners || 0) +
        (artist.metrics?.instagram_followers || 0) +
        (artist.metrics?.tiktok_followers || 0)
    
    return {
        title: `${artist.profile?.name || artist.name} | RosarioHub`,
        description: `${artist.profile?.tagline || 'Artista de Rosario'}${artist.profile?.bio ? ` - ${artist.profile.bio}` : ''} | ${totalFollowers.toLocaleString('es-AR')} seguidores`,
        openGraph: {
            title: `${artist.profile?.name || artist.name} | RosarioHub`,
            description: `${artist.profile?.tagline || 'Artista de Rosario'} | ${totalFollowers.toLocaleString('es-AR')} seguidores en todas las plataformas`,
            url: `https://rosario-hub.vercel.app/${slug}`,
            siteName: 'RosarioHub',
            images: [
                {
                    url: artist.profile?.profileImage || artist.profile?.heroImage || 'https://rosario-hub.vercel.app/og-default.jpg',
                    width: 1200,
                    height: 630,
                    alt: `${artist.profile?.name || artist.name} - RosarioHub`
                }
            ],
            locale: 'es_AR',
            type: 'website'
        },
        twitter: {
            card: 'summary_large_image',
            title: `${artist.profile?.name || artist.name} | RosarioHub`,
            description: `${artist.profile?.tagline || 'Artista de Rosario'} | ${totalFollowers.toLocaleString('es-AR')} seguidores`,
            images: [artist.profile?.profileImage || artist.profile?.heroImage || 'https://rosario-hub.vercel.app/og-default.jpg']
        }
    }
}

export default function SlugLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
