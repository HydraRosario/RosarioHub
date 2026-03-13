'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle } from 'lucide-react'

// Importamos el sistema de componentes
import { 
    useDynamicLayout, 
    MetricData 
} from '../../lib/componentEngine'

// Importamos los componentes visuales
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

// Importamos tu theme engine
import {
    ThemeContext,
    getThemeDefinition,
    injectFonts,
} from '../../themeEngine'

// Importamos tu config de artista
import artistConfig from '../../artistConfig'

// ─────────────────────────────────────────────────────────────
//  HOOKS SIMPLIFICADOS (con fallback)
//──────────────────────────────────────────────────────────────
// Nuevo Hook Unificado para buscar métricas verdaderas del Server
function usePlatformStats(spotifyId: string, youtubeId: string) {
    const [stats, setStats] = useState<{ spotify: MetricData[], youtube: MetricData[] }>({
        spotify: [],
        youtube: []
    })

    useEffect(() => {
        if (!spotifyId && !youtubeId) return

        const fetchAllStats = async () => {
            try {
                // Llamamos a nuestra API Edge que hace el Scraping en el Backend
                const response = await fetch(`/api/stats?spotify=${spotifyId || ''}&youtube=${youtubeId || ''}`)
                const data = await response.json()
                
                if (response.ok) {
                    setStats({
                        spotify: data.spotify || [],
                        youtube: data.youtube || []
                    })
                }
            } catch (err) {
                console.error("Error fetching stats from our API: ", err)
            }
        }
        
        fetchAllStats()
    }, [spotifyId, youtubeId])

    return stats
}

// (Los componentes HeroSection, BookingSection, y Footer directos fueron eliminados y movidos al LegoComponents)

// ─────────────────────────────────────────────────────────────
//  HOMEPAGE DINÁMICA CON SISTEMA LEGO
//──────────────────────────────────────────────────────────────
export default function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
    const [artistData, setArtistData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [slug, setSlug] = useState<string>('')

    // Unwrap params promise
    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params
            setSlug(resolvedParams.slug)
        }
        unwrapParams()
    }, [params])

    // Buscar los datos del artista por su slug en nuestra API local
    useEffect(() => {
        if (!slug) return
        
        const fetchArtistInfo = async () => {
            try {
                const response = await fetch('/api/artists')
                const allArtists = await response.json()
                const found = allArtists.find((a: any) => a.slug === slug)
                if (found) {
                    setArtistData(found)
                } else {
                    // Artista no encontrado
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

    // Obtener métricas REALES desde el Backend (Scraping invisible)
    const { spotify: spotifyStats, youtube: youtubeStats } = usePlatformStats(
        artistConfig.media.spotifyArtistId, 
        artistConfig.media.youtubeChannelId
    )
    
    // Combinar todas las métricas
    const allMetrics = [...spotifyStats, ...youtubeStats]
    
    // Generar layout dinámico
    const { components, relevanceScore } = useDynamicLayout(allMetrics, artistConfig)
    
    // Configurar theme BASADO en el que guardamos en nuestra BD/JSON
    // Si todavía no carga o no existe, usamos el del config base
    const themeToUse = artistData 
        ? { ...getThemeDefinition({ ...artistConfig, theme: artistData.theme }) } 
        : getThemeDefinition(artistConfig)
    
    useEffect(() => {
        injectFonts(themeToUse.fontUrl)
    }, [themeToUse])

    if (loading) {
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

    // Renderizar componentes según el layout dinámico
    const renderComponent = (componentType: string, data: any) => {
        switch (componentType) {
            case 'hero':
                return (
                    <>
                        <DynamicHero profile={{ ...data.profile, name: slug || data.profile.name }} metrics={allMetrics} />
                        <DynamicBio profile={{ ...data.profile, name: slug || data.profile.name }} />
                    </>
                )
            case 'stats':
                return null // Stats ahora están integrados dentro del DynamicHero arriba
            case 'media':
                return <DynamicMediaHub media={data.media} />
            case 'social':
                return <DynamicSocialStack social={data.social} />
            case 'booking':
                return <DynamicBooking booking={data.booking} />
            case 'milestone':
                return <MilestoneBanner milestones={data.milestones} />
            case 'trending':
                return <TrendingAlert trends={data.trends} />
            default:
                return null
        }
    }

    return (
        <ThemeContext.Provider value={themeToUse}>
            <div className="min-h-screen" style={themeToUse.cssVars as React.CSSProperties}>
                {/* Debug info */}
                <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
                    <div>Relevance Score: {relevanceScore}</div>
                    <div>Components: {components.length}</div>
                    <div>Live Metrics: {allMetrics.filter(m => m.isLive).length}</div>
                    <div className="text-green-400 font-bold mt-2">DDBB Status: {artistData.status}</div>
                </div>
                
                {/* Renderizar componentes dinámicos */}
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
                
                {/* Footer siempre visible */}
                <Footer />
            </div>
        </ThemeContext.Provider>
    )
}
