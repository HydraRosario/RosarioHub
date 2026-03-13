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

export async function POST() {
    const dataFilePath = path.join(process.cwd(), 'data.json')
    
    try {
        const artistsData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
        
        const snapshots: Snapshot[] = []
        
        for (const artist of artistsData) {
            const metrics: Snapshot['metrics'] = {}
            
            if (artist.platforms?.youtube?.channelId) {
                const channelId = artist.platforms.youtube.channelId
                const apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyCOdtT-B_IF_R4kyZm1Is02XVHNWK_mrOA'
                
                try {
                    const ytResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
                    )
                    const ytData = await ytResponse.json()
                    
                    if (ytData.items?.[0]?.statistics) {
                        const stats = ytData.items[0].statistics
                        metrics.youtube_subs = parseInt(stats.subscriberCount) || 0
                        metrics.youtube_views = parseInt(stats.viewCount) || 0
                        metrics.youtube_videos = parseInt(stats.videoCount) || 0
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
            
            snapshots.push({
                artistId: artist.id,
                timestamp: new Date().toISOString(),
                metrics
            })
        }
        
        const snapshotsData: SnapshotsData = {
            lastUpdate: new Date().toISOString(),
            snapshots
        }
        
        writeSnapshots(snapshotsData)
        
        return NextResponse.json({ success: true, data: snapshotsData })
    } catch (e) {
        console.error('Snapshot error:', e)
        return NextResponse.json({ error: 'Failed to create snapshots' }, { status: 500 })
    }
}
