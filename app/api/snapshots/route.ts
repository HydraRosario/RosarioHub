import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const snapshotsFilePath = path.join(process.cwd(), 'snapshots.json')

import { Snapshot } from '../../factory/types'

interface SnapshotsData {
    lastUpdate: string
    snapshots: Snapshot[]
}

const readSnapshots = (): SnapshotsData => {
    try {
        if (!fs.existsSync(snapshotsFilePath)) {
            return { lastUpdate: '', snapshots: [] }
        }
        const data = fs.readFileSync(snapshotsFilePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return { lastUpdate: '', snapshots: [] }
    }
}

const writeSnapshots = (data: SnapshotsData): boolean => {
    try {
        fs.writeFileSync(snapshotsFilePath, JSON.stringify(data, null, 2))
        return true
    } catch {
        return false
    }
}

export async function GET() {
    const data = readSnapshots()
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    // Vercel Cron requests include this header
    const vercelCron = request.headers.get('x-vercel-cron')
    
    // Temporarily allow manual execution for debugging
    if (process.env.NODE_ENV === 'development') {
        // Allow manual execution in development
    } else if (vercelCron !== '1') {
        return NextResponse.json({ error: 'Unauthorized - Cron job only' }, { status: 401 })
    }
    
    const dataFilePath = path.join(process.cwd(), 'data.json')
    
    try {
        const artistsData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
        
        const snapshots: Snapshot[] = []
        
        for (const artist of artistsData) {
            const metrics: Snapshot['metrics'] = {
                tiktok_likes: 0
            }
            
            if (artist.platforms?.youtube?.channelId) {
                const channelId = artist.platforms.youtube.channelId
                const apiKey = process.env.YOUTUBE_API_KEY
                
                try {
                    const ytResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings,contentDetails&id=${channelId}&key=${apiKey}`
                    )
                    const ytData = await ytResponse.json()
                    
                    if (ytData.items?.[0]) {
                        const channel = ytData.items[0]
                        
                        // Métricas
                        if (channel.statistics) {
                            const stats = channel.statistics
                            metrics.youtube_subs = parseInt(stats.subscriberCount) || 0
                            metrics.youtube_views = parseInt(stats.viewCount) || 0
                            metrics.youtube_videos = parseInt(stats.videoCount) || 0
                        }
                        
                        // Imágenes del canal (se guardan en el perfil del artista)
                        const ytProfileImage = channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url
                        
                        // Intentar múltiples campos para el banner (según YouTube Data API v3)
                        const branding = channel.brandingSettings?.image
                        const ytBannerImage = branding?.bannerMobileHdImageUrl || 
                                           branding?.bannerMobileImageUrl || 
                                           branding?.bannerHdImageUrl || 
                                           branding?.bannerImageUrl ||
                                           branding?.bannerTabletHdImageUrl ||
                                           branding?.bannerTabletImageUrl ||
                                           branding?.bannerMobileLowImageUrl ||
                                           branding?.bannerTabletLowImageUrl ||
                                           branding?.bannerExternalUrl ||
                                           branding?.bannerMobileExternalUrl ||
                                           branding?.bannerTabletHdExternalUrl ||
                                           branding?.bannerTabletExternalUrl
                        
                        // Proteger imágenes subidas manualmente - no sobrescribir si existen
                        if (!artist.profile) artist.profile = {}
                        
                        if (ytProfileImage && !artist.profile.uploadedHeroImage && !artist.profile.uploadedProfileImage) {
                            artist.profile.profileImage = ytProfileImage
                            artist.profile.youtubeProfileImage = ytProfileImage
                        }
                        
                        if (ytBannerImage && !artist.profile.uploadedHeroImage) {
                            artist.profile.heroImage = ytBannerImage
                            artist.profile.youtubeHeroImage = ytBannerImage
                        }
                    }
                } catch (e) {
                    console.error('YouTube API error:', e)
                }
            }
            
            if (artist.platforms?.spotify?.artistId) {
                try {
                    const spResponse = await fetch(
                        `https://open.spotify.com/artist/${artist.platforms.spotify.artistId}`
                    )
                    const html = await spResponse.text()
                    
                    // Monthly listeners
                    const listenerMatch = html.match(/(\d[\d,]*) monthly listeners/)
                    if (listenerMatch) {
                        metrics.spotify_monthly_listeners = parseInt(listenerMatch[1].replace(/,/g, '')) || 0
                    }
                    
                    // Spotify profile image (og:image)
                    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
                    if (ogImageMatch && ogImageMatch[1]) {
                        if (!artist.profile) artist.profile = {}
                        // Solo guardar si no hay imágenes subidas manualmente
                        if (!artist.profile.uploadedHeroImage && !artist.profile.uploadedProfileImage) {
                            artist.profile.spotifyProfileImage = ogImageMatch[1]
                        }
                    }
                } catch {
                    metrics.spotify_monthly_listeners = 0
                }
            }
            
            if (artist.platforms?.tiktok?.username) {
                try {
                    const ttResponse = await fetch(
                        `https://www.tiktok.com/@${artist.platforms.tiktok.username}?lang=en`
                    )
                    const html = await ttResponse.text()
                    
                    // New TikTok format uses JSON in the HTML
                    const followerMatch = html.match(/"followerCount":(\d+)/)
                    if (followerMatch) {
                        metrics.tiktok_followers = parseInt(followerMatch[1]) || 0
                    }
                    
                    const likesMatch = html.match(/"heartCount":(\d+)/)
                    if (likesMatch) {
                        metrics.tiktok_likes = parseInt(likesMatch[1]) || 0
                    }
                } catch {
                    metrics.tiktok_followers = 0
                    metrics.tiktok_likes = 0
                }
            }
            
            // Instagram - Nota: Instagram ha bloqueado el scrapeo directo
            // Se necesita API oficial o servicio de terceros para obtener datos
            if (artist.platforms?.instagram?.username) {
                try {
                    const username = artist.platforms.instagram.username.replace('@', '')
                    
                    // Intentar con la API de Instagram Graph (requiere token)
                    const igToken = process.env.INSTAGRAM_ACCESS_TOKEN
                    if (igToken) {
                        const igResponse = await fetch(
                            `https://graph.instagram.com/${username}?fields=followers_count&access_token=${igToken}`
                        )
                        if (igResponse.ok) {
                            const data = await igResponse.json()
                            metrics.instagram_followers = data.followers_count || 0
                        }
                    } else {
                        // Sin token, intentar scrapeo básico
                        const igResponse = await fetch(
                            `https://www.instagram.com/${username}/`,
                            { 
                                headers: { 
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                    'Accept-Language': 'en-US,en;q=0.9'
                                } 
                            }
                        )
                        const html = await igResponse.text()
                        
                        // Buscar en diferentes lugares del HTML
                        let followers = 0
                        const patterns = [
                            /"edge_followed_by"\s*:\s*\{[^}]*"count"\s*:\s*(\d+)/,
                            /"followed_by_count"\s*:\s*(\d+)/,
                            /(\d+)\s+followers/
                        ]
                        for (const pattern of patterns) {
                            const match = html.match(pattern)
                            if (match) {
                                followers = parseInt(match[1]) || 0
                                break
                            }
                        }
                        metrics.instagram_followers = followers
                    }
                } catch (e) {
                    console.error('Instagram error:', e)
                    metrics.instagram_followers = 0
                }
            }
            
            // SoundCloud
            if (artist.platforms?.soundcloud?.enabled && artist.social?.soundcloud) {
                try {
                    // Extract username from SoundCloud URL
                    const scUrl = artist.social.soundcloud
                    const scMatch = scUrl.match(/soundcloud\.com\/([^\/]+)/)
                    if (scMatch) {
                        const scResponse = await fetch(
                            `https://api.soundcloud.com/users/${scMatch[1]}`,
                            { headers: { 'Authorization': 'OAuth 2' } }
                        )
                        if (scResponse.ok) {
                            const scData = await scResponse.json()
                            if (scData.followers_count) {
                                metrics.soundcloud_followers = scData.followers_count
                            }
                        }
                    }
                } catch {
                    metrics.soundcloud_followers = 0
                }
            }
            
            // Twitter/X
            if (artist.platforms?.twitter?.enabled && artist.social?.twitter) {
                try {
                    const twUrl = artist.social.twitter
                    const twMatch = twUrl.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/)
                    if (twMatch) {
                        // Try to scrape followers (simplified)
                        const twResponse = await fetch(
                            `https://x.com/${twMatch[1]}`,
                            { headers: { 'User-Agent': 'Mozilla/5.0' } }
                        )
                        if (twResponse.ok) {
                            const html = await twResponse.text()
                            const followersMatch = html.match(/"followers_count":(\d+)/)
                            if (followersMatch) {
                                metrics.twitter_followers = parseInt(followersMatch[1])
                            }
                        }
                    }
                } catch {
                    metrics.twitter_followers = 0
                }
            }
            
            snapshots.push({
                artistId: artist.id,
                timestamp: new Date().toISOString(),
                metrics
            })
            
            // Update artist data with current metrics
            if (artist.metrics) {
                artist.metrics = {
                    ...artist.metrics,
                    ...metrics,
                    lastUpdated: new Date().toISOString()
                }
            } else {
                artist.metrics = {
                    ...metrics,
                    lastUpdated: new Date().toISOString()
                }
            }
        }
        
        // Save updated artists data with metrics
        try {
            fs.writeFileSync(dataFilePath, JSON.stringify(artistsData, null, 2))
            console.log('[Snapshots] Updated data.json with metrics')
        } catch (e) {
            console.error('[Snapshots] Failed to update data.json:', e)
        }
        
        const existingData = readSnapshots()
        const newSnapshots = [...(existingData.snapshots || []), ...snapshots]
        
        // Limitar a los últimos 100 snapshots para evitar que el archivo crezca infinitamente
        const limitedSnapshots = newSnapshots.slice(-100)

        const snapshotsData: SnapshotsData = {
            lastUpdate: new Date().toISOString(),
            snapshots: limitedSnapshots
        }
        
        writeSnapshots(snapshotsData)
        
        return NextResponse.json({ success: true, data: snapshotsData })
    } catch (e) {
        console.error('Snapshot error:', e)
        return NextResponse.json({ error: 'Failed to create snapshots' }, { status: 500 })
    }
}
