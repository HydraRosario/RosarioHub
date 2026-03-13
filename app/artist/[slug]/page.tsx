'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

import { 
    useDynamicLayout, 
    MetricData 
} from '../../lib/componentEngine'

import {
    DynamicHero,
    DynamicBio,
    DynamicMediaHub,
    DynamicSocialStack,
    DynamicBooking,
    Footer,
    MilestoneBanner,
    TrendingAlert
} from '../../components/LegoComponents'

import { useLiveMetrics, PlatformMetric } from '../../components/ClientMetrics'

import {
    ThemeContext,
    getThemeDefinition,
    injectFonts,
} from '../../themeEngine'

import {
    calculateRelevanceScore,
    getSortedPlatforms,
    PlatformScore,
    Platforms
} from '../../lib/rankingEngine'

interface ArtistData {
    id: string
    slug: string
    theme: string
    status: string
    profile: {
        name: string
        tagline: string
        bio: string
        heroImage: string
    }
    platforms: Platforms
    social: {
        instagram: string
        tiktok: string
        youtube: string
        spotify: string
        soundcloud: string
        twitter: string
    }
    booking: {
        whatsapp: string
        whatsappMessage: string
        email: string
    }
    studio: {
        name: string
        url: string
        city: string
    }
    metrics: {
        spotify_listeners: number
        youtube_subs: number
        youtube_views: number
        instagram_followers: number
        tiktok_followers: number
        tiktok_likes: number
        soundcloud_followers: number
        twitter_followers: number
        relevance_score: number
    }
    created_at: string
}

interface PlatformMetrics {
    platform: string
    label: string
    value: string
    numericValue: number
    isLive: boolean
    priority: number
    metric: string
}

function usePlatformStats(platforms: Platforms, jsonMetrics: any) {
    const [allStats, setAllStats] = useState<PlatformMetrics[]>([])
    const [loading, setLoading] = useState(true)

    const spotifyId = platforms.spotify?.artistId || ''
    const youtubeId = platforms.youtube?.channelId || ''
    const instagramUser = platforms.instagram?.username || ''
    const tiktokUser = platforms.tiktok?.username || ''

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                const params = new URLSearchParams()
                if (spotifyId) params.append('spotify', spotifyId)
                if (youtubeId) params.append('youtube', youtubeId)
                if (instagramUser) params.append('instagram', instagramUser)
                if (tiktokUser) params.append('tiktok', tiktokUser)

                const response = await fetch(`/api/stats?${params.toString()}`)
                const data = await response.json()
                
                if (response.ok) {
                    // Map to store best value for each metric type
                    const metricMap = new Map<string, { value: number, isLive: boolean, label: string }>()
                    
                    // Add scraped data first
                    const allScraped = [
                        ...(data.spotify || []),
                        ...(data.youtube || []),
                        ...(data.instagram || []),
                        ...(data.tiktok || [])
                    ]
                    
                    // Add scraped data to map - always keep these as live
                    for (const stat of allScraped) {
                        const key = `${stat.platform}-${stat.metric}`
                        metricMap.set(key, {
                            value: stat.numericValue,
                            isLive: true,
                            label: stat.label
                        })
                    }
                    
                    // Add JSON data - ONLY if no scraped data exists for that metric
                    // This ensures we show scraped (live) data when available
                    if (jsonMetrics) {
                        // Spotify
                        if (jsonMetrics.spotify_listeners > 0 && !metricMap.has('spotify-listeners')) {
                            metricMap.set('spotify-listeners', {
                                value: jsonMetrics.spotify_listeners,
                                isLive: false,
                                label: 'Spotify Oyentes'
                            })
                        }
                        
                        // YouTube Subs - only add if no scraped data
                        if (jsonMetrics.youtube_subs > 0 && !metricMap.has('youtube-subscribers')) {
                            metricMap.set('youtube-subscribers', {
                                value: jsonMetrics.youtube_subs,
                                isLive: false,
                                label: 'YouTube Subs'
                            })
                        }
                        
                        // YouTube Views - only add if no scraped data
                        if (jsonMetrics.youtube_views > 0 && !metricMap.has('youtube-views')) {
                            metricMap.set('youtube-views', {
                                value: jsonMetrics.youtube_views,
                                isLive: false,
                                label: 'YouTube Views'
                            })
                        }
                        
                        // Instagram - add if no scraped data
                        if (jsonMetrics.instagram_followers > 0 && !metricMap.has('instagram-followers')) {
                            metricMap.set('instagram-followers', {
                                value: jsonMetrics.instagram_followers,
                                isLive: false,
                                label: 'Instagram'
                            })
                        }
                        
                        // TikTok Followers - only add if no scraped data
                        if (jsonMetrics.tiktok_followers > 0 && !metricMap.has('tiktok-followers')) {
                            metricMap.set('tiktok-followers', {
                                value: jsonMetrics.tiktok_followers,
                                isLive: false,
                                label: 'TikTok Followers'
                            })
                        }
                        
                        // TikTok Likes - only add if no scraped data
                        if (jsonMetrics.tiktok_likes > 0 && !metricMap.has('tiktok-likes')) {
                            metricMap.set('tiktok-likes', {
                                value: jsonMetrics.tiktok_likes,
                                isLive: false,
                                label: 'TikTok Likes'
                            })
                        }
                    }
                    
                    // Convert to array - sort by highest value
                    const combined: PlatformMetrics[] = Array.from(metricMap.entries()).map(([key, value]) => {
                        const [platform, metric] = key.split('-')
                        return {
                            platform,
                            label: value.label,
                            value: formatNumber(value.value),
                            numericValue: value.value,
                            isLive: value.isLive,
                            priority: getPriority(platform, metric),
                            metric
                        }
                    })
                    
                    // Sort by numeric value (highest first) - THIS IS THE KEY FEATURE!
                    combined.sort((a, b) => b.numericValue - a.numericValue)
                    
                    setAllStats(combined)
                }
            } catch (err) {
                console.error("Error fetching stats: ", err)
                // Fallback to JSON metrics only
                const fallback = buildFromJson(jsonMetrics)
                setAllStats(fallback)
            } finally {
                setLoading(false)
            }
        }
        
        fetchAllStats()
    }, [spotifyId, youtubeId, instagramUser, tiktokUser, jsonMetrics])

    return { allStats, loading }
}

function getPriority(platform: string, metric: string): number {
    if (platform === 'instagram') return 9
    if (platform === 'spotify' && metric === 'listeners') return 8
    if (platform === 'youtube' && metric === 'subscribers') return 6
    if (platform === 'youtube' && metric === 'views') return 5
    if (platform === 'tiktok' && metric === 'followers') return 4
    if (platform === 'tiktok' && metric === 'likes') return 3
    return 5
}

function formatNumber(num: number): string {
    if (!num) return '0'
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

function buildFromJson(metrics: any): PlatformMetrics[] {
    if (!metrics) return []
    const result: PlatformMetrics[] = []
    
    if (metrics.spotify_listeners > 0) result.push({
        platform: 'spotify', label: 'Spotify Oyentes', value: formatNumber(metrics.spotify_listeners),
        numericValue: metrics.spotify_listeners, isLive: false, priority: 8, metric: 'listeners'
    })
    if (metrics.youtube_subs > 0) result.push({
        platform: 'youtube', label: 'YouTube Subs', value: formatNumber(metrics.youtube_subs),
        numericValue: metrics.youtube_subs, isLive: false, priority: 6, metric: 'subscribers'
    })
    if (metrics.youtube_views > 0) result.push({
        platform: 'youtube', label: 'YouTube Views', value: formatNumber(metrics.youtube_views),
        numericValue: metrics.youtube_views, isLive: false, priority: 5, metric: 'views'
    })
    if (metrics.instagram_followers > 0) result.push({
        platform: 'instagram', label: 'Instagram', value: formatNumber(metrics.instagram_followers),
        numericValue: metrics.instagram_followers, isLive: false, priority: 9, metric: 'followers'
    })
    if (metrics.tiktok_followers > 0) result.push({
        platform: 'tiktok', label: 'TikTok Followers', value: formatNumber(metrics.tiktok_followers),
        numericValue: metrics.tiktok_followers, isLive: false, priority: 4, metric: 'followers'
    })
    if (metrics.tiktok_likes > 0) result.push({
        platform: 'tiktok', label: 'TikTok Likes', value: formatNumber(metrics.tiktok_likes),
        numericValue: metrics.tiktok_likes, isLive: false, priority: 3, metric: 'likes'
    })
    
    return result.sort((a, b) => b.numericValue - a.numericValue)
}

export default function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
    const [artistData, setArtistData] = useState<ArtistData | null>(null)
    const [loading, setLoading] = useState(true)
    const [slug, setSlug] = useState<string>('')

    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params
            setSlug(resolvedParams.slug)
        }
        unwrapParams()
    }, [params])

    useEffect(() => {
        if (!slug) return
        
        const fetchArtistInfo = async () => {
            try {
                const response = await fetch('/api/artists')
                const allArtists: ArtistData[] = await response.json()
                const found = allArtists.find((a) => a.slug === slug)
                if (found) {
                    setArtistData(found)
                } else {
                    setArtistData(null)
                }
            } catch (err) {
                console.error("Error al buscar el artista:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchArtistInfo()
    }, [slug])

    // Use cached snapshots (updated once per day)
    const { metrics: liveMetrics, loading: liveLoading, error: liveError, lastUpdate } = useLiveMetrics(
        artistData?.platforms || {},
        artistData?.id
    )
    
    // Build metrics array: live data + fallback to static JSON
    const allMetrics = useMemo(() => {
        const result: any[] = [...liveMetrics]
        
        // Add static metrics as fallback if no live data
        if (artistData?.metrics && liveMetrics.length === 0) {
            const m = artistData.metrics
            if (m.spotify_listeners > 0) result.push({
                label: 'Spotify Oyentes', value: m.spotify_listeners.toString(), 
                numericValue: m.spotify_listeners, platform: 'spotify', isLive: false, priority: 8, metric: 'listeners'
            })
            if (m.youtube_subs > 0) result.push({
                label: 'YouTube Subs', value: m.youtube_subs.toString(), 
                numericValue: m.youtube_subs, platform: 'youtube', isLive: false, priority: 6, metric: 'subscribers'
            })
            if (m.tiktok_followers > 0) result.push({
                label: 'TikTok', value: m.tiktok_followers.toString(), 
                numericValue: m.tiktok_followers, platform: 'tiktok', isLive: false, priority: 4, metric: 'followers'
            })
        }
        
        // Sort by value
        result.sort((a, b) => b.numericValue - a.numericValue)
        return result
    }, [liveMetrics, artistData])

    const allMetricsTyped = allMetrics as unknown as MetricData[]

    const { components, relevanceScore } = useDynamicLayout(allMetricsTyped, artistData || {})

    const themeToUse = artistData 
        ? { ...getThemeDefinition({ ...{ theme: artistData.theme } }) } 
        : getThemeDefinition({ theme: 'SOFT_TRAP' })

    const sortedPlatforms = useMemo(() => {
        if (!allMetrics.length) return []
        return getSortedPlatforms(allMetrics)
    }, [allMetrics])

    const relevanceScoreCalculated = useMemo(() => {
        if (!allMetrics.length) return 0
        return calculateRelevanceScore(allMetrics, artistData?.platforms || {})
    }, [allMetrics, artistData])

    useEffect(() => {
        injectFonts(themeToUse.fontUrl)
    }, [themeToUse])

    const isLoading = loading || liveLoading

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            </div>
        )
    }

    if (!artistData) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-3xl font-bold">
                Artista NO Encontrado ❌
            </div>
        )
    }

    const renderComponent = (componentType: string, data: any) => {
        switch (componentType) {
            case 'hero':
                return (
                    <>
                        <DynamicHero 
                            profile={{ 
                                name: artistData.profile.name,
                                tagline: artistData.profile.tagline,
                                heroImageUrl: artistData.profile.heroImage
                            }} 
                            metrics={allMetricsTyped}
                            sortedPlatforms={sortedPlatforms}
                        />
                        <DynamicBio 
                            profile={{ 
                                name: artistData.profile.name,
                                bio: artistData.profile.bio
                            }} 
                        />
                    </>
                )
            case 'stats':
                return null
            case 'media':
                return <DynamicMediaHub 
                    media={artistData.platforms}
                    social={artistData.social}
                />
            case 'social':
                return <DynamicSocialStack 
                    social={artistData.social}
                    platforms={artistData.platforms}
                />
            case 'booking':
                return <DynamicBooking booking={artistData.booking} />
            case 'milestone':
                return <MilestoneBanner 
                    relevanceScore={relevanceScoreCalculated}
                    metrics={artistData.metrics}
                />
            case 'trending':
                return <TrendingAlert 
                    sortedPlatforms={sortedPlatforms}
                />
            default:
                return null
        }
    }

    return (
        <ThemeContext.Provider value={themeToUse}>
            <div className="min-h-screen" style={themeToUse.cssVars as React.CSSProperties}>
                {process.env.NODE_ENV === 'development' && (
                    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
                        <div>Relevance Score: {relevanceScoreCalculated}</div>
                        <div>Components: {components.length}</div>
                        <div>Live Metrics: {allMetricsTyped.filter((m: any) => m.isLive).length}</div>
                        <div className="text-green-400 font-bold mt-2">Status: {artistData.status}</div>
                    </div>
                )}
                
                {components.map((component, index) => (
                    <motion.div
                        key={component.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {renderComponent(component.type, component.data)}
                    </motion.div>
                ))}
                
                <Footer studio={artistData.studio} />
            </div>
        </ThemeContext.Provider>
    )
}
