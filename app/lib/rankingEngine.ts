export interface PlatformScore {
    platform: string
    score: number
    weight: number
    metric: string
    numericValue: number
}

export interface Platforms {
    spotify?: { artistId?: string; enabled?: boolean }
    youtube?: { channelId?: string; enabled?: boolean }
    instagram?: { username?: string; enabled?: boolean }
    tiktok?: { username?: string; enabled?: boolean }
    soundcloud?: { enabled?: boolean }
    twitter?: { enabled?: boolean }
}

const PLATFORM_WEIGHTS = {
    spotify: 1.0,
    youtube: 0.9,
    instagram: 0.8,
    tiktok: 0.7,
    soundcloud: 0.5,
    twitter: 0.4
}

export function calculateRelevanceScore(
    metrics: PlatformScore[],
    platforms: Platforms
): number {
    if (!metrics || !Array.isArray(metrics)) return 0
    
    let totalScore = 0
    let totalWeight = 0

    for (const metric of metrics) {
        const platform = metric.platform as keyof typeof PLATFORM_WEIGHTS
        const weight = PLATFORM_WEIGHTS[platform] || 0.5
        
        const platformEnabled = platforms[platform]?.enabled !== false
        
        if (platformEnabled && metric.numericValue > 0) {
            const normalizedValue = Math.log10(metric.numericValue + 1)
            totalScore += normalizedValue * weight
            totalWeight += weight
        }
    }

    return totalWeight > 0 ? Math.round(totalScore * 100) : 0
}

export function getSortedPlatforms(
    metrics: PlatformScore[]
): PlatformScore[] {
    if (!metrics || !Array.isArray(metrics)) return []
    return [...metrics].sort((a, b) => {
        const weightDiff = PLATFORM_WEIGHTS[b.platform as keyof typeof PLATFORM_WEIGHTS] - 
                          PLATFORM_WEIGHTS[a.platform as keyof typeof PLATFORM_WEIGHTS]
        if (weightDiff !== 0) return weightDiff
        return b.numericValue - a.numericValue
    })
}

export function calculatePlatformMetrics(platforms: Platforms) {
    return Object.entries(platforms)
        .filter(([key, value]) => value?.enabled && key !== 'soundcloud' && key !== 'twitter')
        .map(([platform, data]) => ({
            platform,
            enabled: true,
            hasData: false
        }))
}

export function formatMetricValue(value: number): string {
    if (!value) return '0'
    return value.toLocaleString('es-AR')
}
