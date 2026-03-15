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
                milestones: []
            }
        },
        {
            key: 'trending',
            condition: relevanceScore > 30,
            data: {
                trends: []
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
            const priorities: Record<string, number> = {
                milestone: 9,
                trending: 9,
                media: 7,
                social: 6,
                booking: 5
            }
            
            components.push({
                type: key as ComponentConfig['type'],
                id: key,
                priority: priorities[key] || 5,
                data,
                conditions: {}
            })
        }
    })
    
    // Ordenar por prioridad
    return components.sort((a, b) => b.priority - a.priority)
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
