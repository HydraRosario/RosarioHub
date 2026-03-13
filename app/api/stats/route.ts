import { NextResponse } from 'next/server'

// Helper function definitions for scraping logic
async function scrapeSpotifyStats(artistId: string) {
    if (!artistId) return null
    try {
        const url = `https://open.spotify.com/artist/${artistId}`
        // Next.js runtime automatically handles fetch
        const response = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            next: { revalidate: 300 } // Caché de 5 minutos (Edge caching)
        })

        if (!response.ok) return null

        const html = await response.text()
        const results: any[] = []

        // 1. Oyentes Mensuales
        const listenersRegex = /([\d.,KMB]+)\s*(?:monthly listeners|oyentes mensuales)/i
        const lMatch = html.match(listenersRegex)
        if (lMatch) {
            results.push({
                label: 'Spotify Oyentes',
                value: lMatch[1],
                platform: 'spotify',
                isLive: true,
                priority: 8 // High priority for ranking engine
            })
        }

        // 2. Play count del top track
        const playsRegex = /\"playCount\":\s*\"(\d+)\"/i
        const pMatch = html.match(playsRegex)
        if (pMatch) {
            const val = parseInt(pMatch[1])
            const formatted = val > 1000 ? (val / 1000).toFixed(1) + 'K' : val.toString()
            results.push({
                label: 'Top Track Plays',
                value: formatted,
                platform: 'spotify',
                isLive: true,
                priority: 7
            })
        }

        return results
    } catch (error) {
        console.error('Error fetching Spotify:', error)
        return null
    }
}

async function scrapeYoutubeStats(channelId: string) {
    if (!channelId) return null
    try {
        const url = `https://www.youtube.com/channel/${channelId}/about?hl=en`
        const response = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            next: { revalidate: 300 } // Caché de 5 minutos (Edge caching)
        })

        if (!response.ok) return null

        const html = await response.text()
        const results: any[] = []

        // 1. Suscriptores (múltiples regex para cubrir variaciones de la web de YT)
        const subsMatch =
            html.match(/\"subscriberCountText\":\{\"accessibility\":\{\"accessibilityData\":\{\"label\":\"([\d.,KMB]+)\s*subscribers/i) ||
            html.match(/\"label\":\"([\d.,KMB]+)\s*suscriptores/i) ||
            html.match(/\"content\":\"([\d.,KMB]+)\s*suscriptores/i) ||
            html.match(/>([\d.,KMB]+)\s*subscribers/i)

        if (subsMatch) {
            results.push({
                label: 'YouTube Subs',
                value: subsMatch[1],
                platform: 'youtube',
                isLive: true,
                priority: 6
            })
        }

        // 2. Vistas totales
        const viewsMatch = html.match(/([\d.,]+)\s*views/i) || html.match(/([\d.,]+)\s*vistas/i)
        if (viewsMatch) {
            results.push({
                label: 'YouTube Views',
                value: viewsMatch[1],
                platform: 'youtube',
                isLive: true,
                priority: 5
            })
        }

        return results
    } catch (error) {
        console.error('Error fetching YouTube:', error)
        return null
    }
}

// Handler Principal (GET)
// Esperamos recibir por URL parameters los IDs: /api/stats?spotify=xyz&youtube=abc
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const spotifyId = searchParams.get('spotify')
    const youtubeId = searchParams.get('youtube')

    if (!spotifyId && !youtubeId) {
        return NextResponse.json({ error: 'Missing platform IDs' }, { status: 400 })
    }

    try {
        // Hacemos el fetchig en paralelo para mayor velocidad
        const [spotifyStats, youtubeStats] = await Promise.all([
            spotifyId ? scrapeSpotifyStats(spotifyId) : null,
            youtubeId ? scrapeYoutubeStats(youtubeId) : null,
        ])

        return NextResponse.json({
            spotify: spotifyStats || [],
            youtube: youtubeStats || [],
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to scrape statistics' },
            { status: 500 }
        )
    }
}
