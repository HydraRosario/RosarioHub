// ─────────────────────────────────────────────────────────────
//  COMPONENT ENGINE - Sistema Lego Dinámico
//  Los componentes se renderizan según las métricas en tiempo real
//──────────────────────────────────────────────────────────────

import { calculateRelevanceScore } from './rankingEngine'
import { MetricData } from '../factory/types'

export interface ComponentConfig {
    type: 'hero' | 'stats' | 'media' | 'social' | 'booking' | 'milestone' | 'trending'
    id: string
    priority: number
    data: any
    conditions: {
        minMetrics?: number
        requiredPlatforms?: string[]
        minGrowth?: number
    }
}

// ─────────────────────────────────────────────────────────────
//  COMPONENT MAP - Definición de componentes Lego
//──────────────────────────────────────────────────────────────
export const COMPONENT_MAP = {
    // Hero siempre visible
    hero: {
        type: 'hero' as const,
        priority: 10,
        conditions: {},
        render: (data: any) => ({
            component: 'HeroSection',
            props: { profile: data.profile }
        })
    },

    // Stats básicas
    stats: {
        type: 'stats' as const,
        priority: 8,
        conditions: {},
        render: (data: any) => ({
            component: 'StatsSection',
            props: { metrics: data.metrics }
        })
    },

    // Media si hay contenido
    media: {
        type: 'media' as const,
        priority: 7,
        conditions: { minMetrics: 2 },
        render: (data: any) => ({
            component: 'MediaHub',
            props: { media: data.media }
        })
    },

    // Social si hay seguidores
    social: {
        type: 'social' as const,
        priority: 6,
        conditions: { minMetrics: 1 },
        render: (data: any) => ({
            component: 'SocialStack',
            props: { social: data.social }
        })
    },

    // Milestones si hay crecimiento
    milestone: {
        type: 'milestone' as const,
        priority: 9,
        conditions: { minGrowth: 5 },
        render: (data: any) => ({
            component: 'MilestoneBanner',
            props: { milestones: data.milestones }
        })
    },

    // Trending si hay picos de actividad
    trending: {
        type: 'trending' as const,
        priority: 9,
        conditions: { minGrowth: 10 },
        render: (data: any) => ({
            component: 'TrendingAlert',
            props: { trends: data.trends }
        })
    },

    // Booking siempre visible
    booking: {
        type: 'booking' as const,
        priority: 5,
        conditions: {},
        render: (data: any) => ({
            component: 'BookingSection',
            props: { booking: data.booking }
        })
    }
}

// ─────────────────────────────────────────────────────────────
//  MOTOR DE COMPONENTES DINÁMICOS
//──────────────────────────────────────────────────────────────
export function generateDynamicLayout(
    metrics: MetricData[],
    artistData: any
): ComponentConfig[] {
    const relevanceScore = calculateRelevanceScore(metrics, artistData.platforms || {})
    const components: ComponentConfig[] = []
    
    // Siempre incluimos hero
    components.push({
        type: 'hero',
        id: 'hero',
        priority: 10,
        data: artistData,
        conditions: {}
    })
    
    // Stats siempre visibles
    components.push({
        type: 'stats',
        id: 'stats',
        priority: 8,
        data: { metrics },
        conditions: {}
    })
    
    // Componentes condicionales
    const hasPlatforms = artistData?.platforms && (
        (artistData.platforms.spotify?.enabled) ||
        (artistData.platforms.youtube?.enabled) ||
        (artistData.platforms.instagram?.enabled) ||
        (artistData.platforms.tiktok?.enabled)
    )
    
    const conditionalComponents = [
        {
            key: 'milestone',
            condition: relevanceScore > 20,
            data: { 
                milestones: detectMilestones(metrics)
            }
        },
        {
            key: 'trending',
            condition: relevanceScore > 30,
            data: {
                trends: detectTrends(metrics)
            }
        },
        {
            key: 'media',
            condition: hasPlatforms && artistData?.platforms,
            data: { 
                media: artistData?.platforms || {},
                social: artistData?.social || {}
            }
        },
        {
            key: 'social',
            condition: artistData?.social && Object.keys(artistData.social).some(k => artistData.social[k]),
            data: { 
                social: artistData?.social || {},
                platforms: artistData?.platforms || {}
            }
        },
        {
            key: 'booking',
            condition: artistData?.booking,
            data: { booking: artistData?.booking }
        }
    ]
    
    // Agregar componentes que cumplen condiciones
    conditionalComponents.forEach(({ key, condition, data }) => {
        if (condition) {
            const componentDef = COMPONENT_MAP[key as keyof typeof COMPONENT_MAP]
            components.push({
                type: componentDef.type,
                id: key,
                priority: componentDef.priority,
                data,
                // @ts-ignore
                conditions: componentDef.conditions || {}
            })
        }
    })
    
    // Ordenar por prioridad
    return components.sort((a, b) => b.priority - a.priority)
}

// ─────────────────────────────────────────────────────────────
//  DETECCIÓN DE MILESTONES
//──────────────────────────────────────────────────────────────
export function detectMilestones(metrics: MetricData[]): any[] {
    const milestones: any[] = []
    
    metrics.forEach(metric => {
        const value = parseInt(metric.value.replace(/[^0-9]/g, ''))
        
        if (metric.platform === 'spotify' && value >= 10000) {
            milestones.push({
                type: 'spotify_listeners',
                title: '🎵 10K+ Oyentes en Spotify!',
                value: metric.value,
                icon: '🎵'
            })
        }
        
        if (metric.platform === 'youtube' && value >= 1000) {
            milestones.push({
                type: 'youtube_subs',
                title: '📺 1K+ Suscriptores!',
                value: metric.value,
                icon: '📺'
            })
        }
    })
    
    return milestones
}

// ─────────────────────────────────────────────────────────────
//  DETECCIÓN DE TRENDS
//──────────────────────────────────────────────────────────────
export function detectTrends(metrics: MetricData[]): any[] {
    const trends: any[] = []
    
    metrics.forEach(metric => {
        if (metric.growth && metric.growth > 10) {
            trends.push({
                platform: metric.platform,
                metric: metric.label,
                growth: metric.growth,
                status: 'viral'
            })
        }
    })
    
    return trends
}

// ─────────────────────────────────────────────────────────────
//  HOOK PARA LAYOUT DINÁMICO
//──────────────────────────────────────────────────────────────
export interface DynamicLayout {
    components: ComponentConfig[]
    relevanceScore: number
    lastUpdate: Date
}

export function useDynamicLayout(
    metrics: MetricData[],
    artistData: any
): DynamicLayout {
    const layout = generateDynamicLayout(metrics, artistData)
    const relevanceScore = calculateRelevanceScore(metrics, artistData.platforms || {})
    
    return {
        components: layout,
        relevanceScore,
        lastUpdate: new Date()
    }
}
