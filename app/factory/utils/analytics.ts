export interface Settings {
    leaderboard: {
        platforms: boolean
        top10: boolean
        growth: boolean
        legacy: boolean
        reach: boolean
    }
}

export interface ArtistWithStats {
    growth: number
    impact: number
    currentTotal: number
    [key: string]: any
}

export function formatNumber(num: number): string {
    if (!num || num === 0) return '0'
    return Math.round(num).toLocaleString('es-AR')
}

export function formatGrowth(percentage: number): string {
    if (percentage > 0) return `+${Math.round(percentage)}%`
    if (percentage < 0) return `${Math.round(percentage)}%`
    return '0%'
}

export function getTotalFans(m: any) {
    return (Number(m.youtube_subs) || 0) + 
           (Number(m.spotify_listeners) || 0) + 
           (Number(m.tiktok_followers) || 0) + 
           (Number(m.instagram_followers) || 0) +
           (Number(m.soundcloud_followers) || 0) + 
           (Number(m.twitter_followers) || 0)
}

export function getHistoricalImpact(m: any) {
    return (Number(m.youtube_views) || 0) + getTotalFans(m)
}

export function calculateAnalytics(artists: any[], snapshots: any[]) {
    // Adoption
    const platformCounts: any = { spotify: 0, youtube: 0, tiktok: 0, instagram: 0, soundcloud: 0, twitter: 0 }
    artists.forEach(a => {
        if (a.platforms?.spotify?.enabled) platformCounts.spotify++
        if (a.platforms?.youtube?.enabled) platformCounts.youtube++
        if (a.platforms?.instagram?.enabled) platformCounts.instagram++
        if (a.platforms?.tiktok?.enabled) platformCounts.tiktok++
        if (a.platforms?.soundcloud?.enabled) platformCounts.soundcloud++
        if (a.platforms?.twitter?.enabled) platformCounts.twitter++
    })
    const totalA = artists.length || 1
    const adoptionStats = Object.entries(platformCounts).map(([platform, value]) => ({
        platform, value: value as number, percentage: Math.round((value as number / totalA) * 100)
    })).sort((a, b) => b.value - a.value)

    if (!snapshots.length) {
        return { topPopularity: [], topGrowing: [], topImpact: [], systemReachHistory: [], adoptionStats, globalTotalReach: 0 }
    }

    // Artist Stats
    const artistsWithStats: ArtistWithStats[] = artists.map(artist => {
        const artistSnaps = snapshots
            .filter((s: any) => s.artistId === artist.id)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        const lastMetrics = artistSnaps.length > 0 ? artistSnaps[artistSnaps.length - 1].metrics : (artist.metrics || {})
        const firstMetrics = artistSnaps.length > 1 ? artistSnaps[0].metrics : lastMetrics

        const firstTotal = getTotalFans(firstMetrics)
        const lastTotal = getTotalFans(lastMetrics)
        const impactTotal = (Number(lastMetrics.youtube_views) || 0) + lastTotal
        const growth = firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal) * 100 : 0
        
        return { ...artist, growth, impact: impactTotal, currentTotal: lastTotal }
    })

    const globalTotalReach = artistsWithStats.reduce((sum, a) => sum + a.currentTotal, 0)

    // Detailed metrics totals (Current)
    const metricsTotals = artists.reduce((acc: any, artist) => {
        const m = artist.metrics || {}
        acc.youtube_subs += Number(m.youtube_subs) || 0
        acc.youtube_views += Number(m.youtube_views) || 0
        acc.spotify_listeners += Number(m.spotify_listeners) || 0
        acc.tiktok_followers += Number(m.tiktok_followers) || 0
        acc.instagram_followers += Number(m.instagram_followers) || 0
        acc.soundcloud_followers += Number(m.soundcloud_followers) || 0
        acc.twitter_followers += Number(m.twitter_followers) || 0
        return acc
    }, { youtube_subs: 0, youtube_views: 0, spotify_listeners: 0, tiktok_followers: 0, instagram_followers: 0, soundcloud_followers: 0, twitter_followers: 0 })

    const totalEverything = Object.values(metricsTotals).reduce((a: any, b: any) => a + b, 0) as number

    // History
    const reachByTimestamp: Record<string, number> = {}
    snapshots.forEach((s: any) => {
        const date = s.timestamp.split('T')[0]
        if (!reachByTimestamp[date]) reachByTimestamp[date] = 0
        reachByTimestamp[date] += getTotalFans(s.metrics)
    })

    const systemReachHistory = Object.entries(reachByTimestamp).map(([timestamp, value]) => ({
        timestamp, value: value as number
    })).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return {
        topPopularity: [...artistsWithStats].sort((a, b) => b.currentTotal - a.currentTotal),
        topGrowing: [...artistsWithStats].sort((a, b) => b.growth - a.growth),
        topImpact: [...artistsWithStats].sort((a, b) => b.impact - a.impact),
        systemReachHistory,
        adoptionStats,
        globalTotalReach,
        metricsTotals,
        totalEverything
    }
}
