import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const snapshotsFilePath = path.join(process.cwd(), 'snapshots.json')

interface Snapshot {
    artistId: string
    timestamp: string
    metrics: {
        youtube_subs?: number
        youtube_views?: number
        youtube_videos?: number
        spotify_listeners?: number
        tiktok_followers?: number
        instagram_followers?: number
        soundcloud_followers?: number
        twitter_followers?: number
    }
}

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
    if (vercelCron !== '1') {
        return NextResponse.json({ error: 'Unauthorized - Cron job only' }, { status: 401 })
    }
    
    const dataFilePath = path.join(process.cwd(), 'data.json')
    
    try {
        const artistsData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
        
        const snapshots: Snapshot[] = []
        
        for (const artist of artistsData) {
            const metrics: Snapshot['metrics'] = {}
            
            if (artist.platforms?.youtube?.channelId) {
                const channelId = artist.platforms.youtube.channelId
                const apiKey = process.env.YOUTUBE_API_KEY
                
                try {
                    const ytResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${channelId}&key=${apiKey}`
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
                        if (channel.snippet?.thumbnails || channel.brandingSettings?.image) {
                            const profileImage = channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url
                            const bannerImage = channel.brandingSettings?.image?.bannerMobileHdImageUrl || channel.brandingSettings?.image?.bannerHdImageUrl || channel.brandingSettings?.image?.bannerImageUrl
                            
                            if (!artist.profile) artist.profile = {}
                            if (profileImage) artist.profile.profileImage = profileImage
                            if (bannerImage) artist.profile.heroImage = bannerImage
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
                    const listenerMatch = html.match(/(\d[\d,]*) monthly listeners/)
                    if (listenerMatch) {
                        metrics.spotify_listeners = parseInt(listenerMatch[1].replace(/,/g, '')) || 0
                    }
                } catch {
                    metrics.spotify_listeners = 0
                }
            }
            
            if (artist.platforms?.tiktok?.username) {
                try {
                    const ttResponse = await fetch(
                        `https://www.tiktok.com/@${artist.platforms.tiktok.username}?lang=en`
                    )
                    const html = await ttResponse.text()
                    const followerMatch = html.match(/(\d[\d,]*) Followers/)
                    if (followerMatch) {
                        metrics.tiktok_followers = parseInt(followerMatch[1].replace(/,/g, '')) || 0
                    }
                } catch {
                    metrics.tiktok_followers = 0
                }
            }
            
            // Instagram
            if (artist.platforms?.instagram?.username) {
                try {
                    const username = artist.platforms.instagram.username.replace('@', '')
                    const igResponse = await fetch(
                        `https://www.instagram.com/${username}/?__a=1&__d=1`
                    )
                    if (igResponse.ok) {
                        const igData = await igResponse.json()
                        const user = igData?.graphql?.user
                        if (user?.edge_followed_by?.count) {
                            metrics.instagram_followers = user.edge_followed_by.count
                        }
                    }
                } catch {
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
