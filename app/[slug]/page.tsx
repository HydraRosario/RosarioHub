'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

import { Artist, MetricData } from '../factory/types'

import {
    DynamicHero,
    DynamicBio,
    DynamicMediaHub,
    DynamicSocialStack,
    DynamicBooking,
    Footer
} from '../components/LegoComponents'

import {
    ThemeContext,
    getThemeDefinition,
    injectFonts,
} from '../themeEngine'

import {
    calculateRelevanceScore,
    getSortedPlatforms,
} from '../lib/rankingEngine'

import { 
    useDynamicLayout
} from '../lib/componentEngine'

function formatNumber(num: number): string {
    if (!num) return '0'
    return num.toLocaleString('es-AR')
}

export default function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
    const [artistData, setArtistData] = useState<Artist | null>(null)
    const [loading, setLoading] = useState(true)
    const [slug, setSlug] = useState<string>('')
    const [snapshots, setSnapshots] = useState<any[]>([])

    useEffect(() => {
        const fetchSnapshots = async () => {
            try {
                const response = await fetch('/api/snapshots')
                const data = await response.json()
                if (data.snapshots) {
                    setSnapshots(data.snapshots)
                }
            } catch (err) {
                console.error("Error al cargar snapshots:", err)
            }
        }
        fetchSnapshots()
    }, [])

    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params
            const decodedSlug = decodeURIComponent(resolvedParams.slug)
            setSlug(decodedSlug)
        }
        unwrapParams()
    }, [params])

    useEffect(() => {
        if (!slug) return
        
        const fetchArtistInfo = async () => {
            try {
                const response = await fetch('/api/artists')
                const allArtists: Artist[] = await response.json()
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

    // Use metrics from the artist object (cached in data.json)
    const allMetrics = useMemo(() => {
        const result: MetricData[] = []
        const m = artistData?.metrics
        
        if (m) {
            if (m.spotify_listeners > 0) result.push({
                label: 'Spotify Oyentes', value: m.spotify_listeners.toLocaleString('es-AR'), 
                numericValue: m.spotify_listeners, platform: 'spotify', isLive: true, metric: 'listeners'
            })
            if (m.youtube_subs > 0) result.push({
                label: 'YouTube Subs', value: m.youtube_subs.toLocaleString('es-AR'), 
                numericValue: m.youtube_subs, platform: 'youtube', isLive: true, metric: 'subscribers'
            })
            if (m.youtube_views > 0) result.push({
                label: 'YouTube Views', value: m.youtube_views.toLocaleString('es-AR'), 
                numericValue: m.youtube_views, platform: 'youtube', isLive: true, metric: 'views'
            })
            if (m.tiktok_followers > 0) result.push({
                label: 'TikTok', value: m.tiktok_followers.toLocaleString('es-AR'), 
                numericValue: m.tiktok_followers, platform: 'tiktok', isLive: true, metric: 'followers'
            })
            if (m.instagram_followers > 0) result.push({
                label: 'Instagram', value: m.instagram_followers.toLocaleString('es-AR'), 
                numericValue: m.instagram_followers, platform: 'instagram', isLive: true, metric: 'followers'
            })
        }
        
        return result.sort((a, b) => b.numericValue - a.numericValue)
    }, [artistData?.metrics])

    // Calculate time since last update
    const lastUpdated = useMemo(() => {
        const timestamp = artistData?.metrics?.lastUpdated
        if (!timestamp) return null
        const diff = Date.now() - new Date(timestamp).getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        if (hours > 0) return `hace ${hours}h ${minutes}m`
        if (minutes > 0) return `hace ${minutes}m`
        return 'hace un momento'
    }, [artistData?.metrics])

    const historyByMetric = useMemo(() => {
        if (!artistData || !snapshots.length) return {}
        
        const artistSnapshots = snapshots
            .filter(s => s.artistId === artistData.id)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        const history: Record<string, {timestamp: string, value: number}[]> = {}
        const metricKeys = ['youtube_subs', 'youtube_views', 'spotify_listeners', 'tiktok_followers', 'instagram_followers']
        
        metricKeys.forEach(m => {
            history[m] = artistSnapshots
                .filter(s => s.metrics[m] !== undefined)
                .map(s => ({
                    timestamp: s.timestamp,
                    value: s.metrics[m]
                }))
        })
        
        return history
    }, [artistData, snapshots])

    const { components, relevanceScore: relevanceScoreCalculated } = useDynamicLayout(allMetrics, artistData || {})

    const themeToUse = artistData 
        ? getThemeDefinition({ theme: artistData.theme }) 
        : getThemeDefinition({ theme: 'SOFT_TRAP' })

    const sortedPlatforms = useMemo(() => {
        return getSortedPlatforms(allMetrics)
    }, [allMetrics])

    useEffect(() => {
        injectFonts(themeToUse.fontUrl)
    }, [themeToUse])

    const isLoading = loading

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
                                heroImageUrl: artistData.profile.heroImage,
                                profileImage: artistData.profile.profileImage
                            }} 
                            metrics={allMetrics}
                            lastUpdated={lastUpdated}
                            history={historyByMetric}
                        />
                        <DynamicBio 
                            profile={{ 
                                name: artistData.profile.name,
                                bio: artistData.profile.bio,
                                heroImageUrl: artistData.profile.heroImage,
                                profileImage: artistData.profile.profileImage
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
                        <div>Live Metrics: {allMetrics.filter((m: any) => m.isLive).length}</div>
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
                
                <Footer />
            </div>
        </ThemeContext.Provider>
    )
}
