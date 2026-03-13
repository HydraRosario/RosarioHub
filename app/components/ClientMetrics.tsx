'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PlatformMetric {
    label: string
    value: string
    numericValue: number
    platform: string
    isLive: boolean
    priority: number
    metric: string
}

function formatNumber(num: number): string {
    if (!num) return '0'
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

export function useLiveMetrics(platforms: {
    spotify?: { artistId?: string }
    youtube?: { channelId?: string }
    instagram?: { username?: string }
    tiktok?: { username?: string }
}, artistId?: string) {
    const [metrics, setMetrics] = useState<PlatformMetric[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdate, setLastUpdate] = useState<string | null>(null)

    const fetchAllMetrics = useCallback(async () => {
        if (!platforms?.youtube?.channelId && !platforms?.spotify?.artistId && !platforms?.tiktok?.username) {
            setLoading(false)
            return
        }
        
        setLoading(true)
        setError(null)
        
        const results: PlatformMetric[] = []
        
        const youTubeId = platforms.youtube?.channelId
        const spotifyId = platforms.spotify?.artistId
        const tiktokUser = platforms.tiktok?.username
        
        try {
            const snapshotResponse = await fetch('/api/snapshots', { cache: 'no-store' })
            if (snapshotResponse.ok) {
                const snapshotData = await snapshotResponse.json()
                setLastUpdate(snapshotData.lastUpdate)
                
                const artistsResponse = await fetch('/api/artists')
                const artists = await artistsResponse.json()
                
                const matchedArtist = artists.find((artist: any) => {
                    const p = artist.platforms || {}
                    
                    const ytMatch = p.youtube?.channelId === youTubeId && youTubeId
                    const spMatch = p.spotify?.artistId === spotifyId && spotifyId
                    const ttMatch = p.tiktok?.username === tiktokUser && tiktokUser
                    
                    return ytMatch || spMatch || ttMatch
                })
                
                if (matchedArtist) {
                    const artistSnapshot = snapshotData.snapshots?.find((s: any) => 
                        s.artistId === matchedArtist.id
                    )
                    
                    if (artistSnapshot?.metrics) {
                        const m = artistSnapshot.metrics
                        
                        if (m.youtube_subs) {
                            results.push({
                                label: 'YouTube Subs',
                                value: formatNumber(m.youtube_subs),
                                numericValue: m.youtube_subs,
                                platform: 'youtube',
                                isLive: false,
                                priority: 6,
                                metric: 'subscribers'
                            })
                        }
                        if (m.youtube_views) {
                            results.push({
                                label: 'YouTube Views',
                                value: formatNumber(m.youtube_views),
                                numericValue: m.youtube_views,
                                platform: 'youtube',
                                isLive: false,
                                priority: 5,
                                metric: 'views'
                            })
                        }
                        if (m.youtube_videos) {
                            results.push({
                                label: 'YouTube Videos',
                                value: m.youtube_videos.toString(),
                                numericValue: m.youtube_videos,
                                platform: 'youtube',
                                isLive: false,
                                priority: 2,
                                metric: 'videos'
                            })
                        }
                        if (m.spotify_listeners) {
                            results.push({
                                label: 'Spotify Oyentes',
                                value: formatNumber(m.spotify_listeners),
                                numericValue: m.spotify_listeners,
                                platform: 'spotify',
                                isLive: false,
                                priority: 8,
                                metric: 'listeners'
                            })
                        }
                        if (m.tiktok_followers) {
                            results.push({
                                label: 'TikTok',
                                value: formatNumber(m.tiktok_followers),
                                numericValue: m.tiktok_followers,
                                platform: 'tiktok',
                                isLive: false,
                                priority: 4,
                                metric: 'followers'
                            })
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching snapshot metrics:', e)
        }

        if (results.length === 0) {
            const params = new URLSearchParams()
            if (spotifyId) params.append('spotify', spotifyId)
            if (youTubeId) params.append('youtube', youTubeId)
            if (platforms.instagram?.username) params.append('instagram', platforms.instagram.username)
            if (tiktokUser) params.append('tiktok', tiktokUser)

            try {
                const response = await fetch(`/api/stats?${params.toString()}`, {
                    cache: 'no-store'
                })
                
                if (response.ok) {
                    const data = await response.json()
                    
                    const allStats = [
                        ...(data.spotify || []),
                        ...(data.youtube || []),
                        ...(data.instagram || []),
                        ...(data.tiktok || [])
                    ]
                    
                    for (const stat of allStats) {
                        results.push({
                            label: stat.label,
                            value: stat.value,
                            numericValue: stat.numericValue,
                            platform: stat.platform,
                            isLive: true,
                            priority: stat.priority,
                            metric: stat.metric
                        })
                    }
                }
            } catch (e) {
                console.error('Error fetching metrics:', e)
            }
        }
        
        results.sort((a, b) => b.numericValue - a.numericValue)
        
        setMetrics(results)
        setLoading(false)
    }, [platforms, artistId])

    useEffect(() => {
        fetchAllMetrics()
    }, [fetchAllMetrics])

    return { metrics, loading, error, refresh: fetchAllMetrics, lastUpdate }
}
