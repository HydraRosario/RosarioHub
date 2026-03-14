import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

function formatNumber(num: number): string {
    if (!num || num === 0) return '0'
    return num.toLocaleString('es-AR')
}

function formatGrowth(percentage: number): string {
    if (percentage > 0) return `+${percentage}%`
    if (percentage < 0) return `${percentage}%`
    return '0%'
}

function getTotalMetrics(metrics: any): number {
    return (metrics.youtube_subs || 0) + 
           (metrics.spotify_listeners || 0) + 
           (metrics.tiktok_followers || 0) +
           (metrics.instagram_followers || 0) +
           (metrics.soundcloud_followers || 0) +
           (metrics.twitter_followers || 0)
}

function getHistoricalImpact(metrics: any): number {
    return (metrics.youtube_views || 0) + 
           (metrics.youtube_subs || 0) + 
           (metrics.spotify_listeners || 0) + 
           (metrics.tiktok_followers || 0) +
           (metrics.instagram_followers || 0)
}

async function getArtists() {
    const dataFilePath = path.join(process.cwd(), 'data.json')
    try {
        const data = fs.readFileSync(dataFilePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

async function getSnapshots() {
    const snapshotsPath = path.join(process.cwd(), 'snapshots.json')
    try {
        const data = fs.readFileSync(snapshotsPath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return { lastUpdate: '', snapshots: [] }
    }
}

export default async function LeaderboardPage() {
    const artists = await getArtists()
    const snapshotsData = await getSnapshots()
    
    const activeArtists = artists.filter((a: any) => a.status === 'active')
    const snapshots = snapshotsData.snapshots || []
    
    // Process artists with their metrics and growth
    const artistsWithData = activeArtists.map((artist: any) => {
        const artistSnaps = snapshots
            .filter((s: any) => s.artistId === artist.id)
            .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        const currentMetrics = artistSnaps.length > 0 ? artistSnaps[artistSnaps.length - 1].metrics : (artist.metrics || {})
        const firstMetrics = artistSnaps.length > 1 ? artistSnaps[0].metrics : currentMetrics
        
        const currentTotal = getTotalMetrics(currentMetrics)
        const firstTotal = getTotalMetrics(firstMetrics)
        const totalImpact = getHistoricalImpact(currentMetrics)
        
        let growthPercentage = 0
        if (firstTotal > 0 && artistSnaps.length > 1) {
            growthPercentage = Math.round(((currentTotal - firstTotal) / firstTotal) * 100)
        }
        
        return {
            ...artist,
            currentMetrics,
            total: currentTotal,
            impact: totalImpact,
            growth: growthPercentage,
            hasPreviousData: artistSnaps.length > 1,
            history: artistSnaps.map((s: any) => ({
                timestamp: s.timestamp,
                value: getTotalMetrics(s.metrics)
            }))
        }
    })
    
    // Sort by total metrics (for Top 10)
    const sortedByTotal = [...artistsWithData].sort((a, b) => b.total - a.total)
    const top10ByTotal = sortedByTotal.slice(0, 10)
    
    // Sort by growth (for Trending)
    const sortedByGrowth = [...artistsWithData].sort((a, b) => b.growth - a.growth)
    const top10ByGrowth = sortedByGrowth.slice(0, 10)

    // Sort by Historical Impact (Legado)
    const sortedByImpact = [...artistsWithData].sort((a, b) => b.impact - a.impact)
    const top10ByImpact = sortedByImpact.slice(0, 10)

    // Calculate Global Platform Distribution
    const platformTotals: any = {
        spotify: 0, youtube: 0, tiktok: 0, instagram: 0
    }

    artistsWithData.forEach((a: any) => {
        const m = a.currentMetrics
        platformTotals.spotify += m.spotify_listeners || 0
        platformTotals.youtube += m.youtube_subs || 0
        platformTotals.tiktok += m.tiktok_followers || 0
        platformTotals.instagram += m.instagram_followers || 0
    })

    const totalSystemReach = Object.values(platformTotals).reduce((a: any, b: any) => a + b, 0) as number || 1
    const platformStats = Object.entries(platformTotals).map(([platform, value]: [string, any]) => ({
        platform,
        percentage: Math.round((value / totalSystemReach) * 100)
    })).sort((a, b) => b.percentage - a.percentage)

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
            {/* GLOBAL ANALYTICS PREVIEW */}
            {totalSystemReach > 0 && (
                <section className="pt-20 pb-10 px-6 border-b border-white/5">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-sm uppercase tracking-[0.3em] text-purple-500 font-black mb-8 text-center">
                            Distribución de Fans por Plataforma
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {platformStats.map((stat: any) => (
                                <div key={stat.platform} className="flex flex-col items-center">
                                    <div className="text-3xl font-black mb-2">{stat.percentage}%</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">{stat.platform}</div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full opacity-60 ${
                                                stat.platform === 'spotify' ? 'bg-green-500' :
                                                stat.platform === 'youtube' ? 'bg-red-500' :
                                                stat.platform === 'instagram' ? 'bg-pink-500' :
                                                stat.platform === 'tiktok' ? 'bg-white' : 'bg-purple-500'
                                            }`}
                                            style={{ width: `${stat.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* TOP 10 BY TOTAL METRICS */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                🏆 Top 10 Rosario
                            </h2>
                            <p className="text-gray-400">
                                Los artistas con más reach en la ciudad
                                {snapshotsData.lastUpdate && (
                                    <span className="text-sm ml-2">
                                        (actualizado {new Date(snapshotsData.lastUpdate).toLocaleDateString('es-AR')})
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {top10ByTotal.length > 0 ? (
                        <div className="grid gap-3">
                            {top10ByTotal.map((artist: any, index: number) => (
                                <a 
                                    key={artist.id}
                                    href={`/artist/${artist.slug}`}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all ${
                                        index < 3 ? 'ring-1 ring-yellow-500/30' : ''
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                                        index === 0 ? 'bg-yellow-500 text-black' :
                                        index === 1 ? 'bg-gray-300 text-black' :
                                        index === 2 ? 'bg-amber-600 text-white' :
                                        'bg-white/10 text-gray-400'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate group-hover:text-purple-400 transition-colors">
                                            {artist.profile?.name || artist.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 truncate">
                                            {artist.profile?.tagline || artist.theme}
                                        </p>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-purple-400">
                                            {formatNumber(artist.total)}
                                        </div>
                                        <div className="text-xs text-gray-500">total</div>
                                    </div>
                                    
                                    {index < 3 && (
                                        <div className="text-2xl">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-lg">No hay datos de métricas aún</p>
                            <p className="text-sm mt-2">Ejecutá el scraping para ver el ranking</p>
                        </div>
                    )}
                </div>
            </section>

            {/* TOP 10 BY GROWTH */}
            <section className="py-16 px-6 bg-black/30">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                📈 En Ascenso
                            </h2>
                            <p className="text-gray-400">
                                Los artistas que están creciendo más rápido
                                {!snapshotsData.lastUpdate && (
                                    <span className="text-sm ml-2">
                                        (necesitamos más datos para calcular)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {top10ByGrowth.length > 0 && snapshots.length > 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {top10ByGrowth.map((artist: any, index: number) => (
                                <a 
                                    key={artist.id}
                                    href={`/artist/${artist.slug}`}
                                    className="group flex flex-col p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                        <span className="text-6xl font-black">#{index + 1}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl bg-green-500/20 text-green-400 border border-green-500/30`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl group-hover:text-green-400 transition-colors">
                                                {artist.profile?.name || artist.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatNumber(artist.total)} seguidores totales
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto flex items-end justify-between">
                                        <div className={`text-3xl font-black ${
                                            artist.growth > 0 ? 'text-green-400' : 
                                            artist.growth < 0 ? 'text-red-400' : 'text-gray-400'
                                        }`}>
                                            {formatGrowth(artist.growth)}
                                        </div>
                                        <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">
                                            Growth Rate
                                        </div>
                                    </div>

                                    {/* Visual "Sparkline" placeholder/concept */}
                                    <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 transition-all duration-1000"
                                            style={{ width: `${Math.min(100, Math.max(0, artist.growth))}%` }}
                                        />
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-lg">Necesitamos más datos para calcular crecimiento</p>
                            <p className="text-sm mt-2">
                                {snapshots.length === 0 
                                    ? 'Ejecutá el scraping al menos 2 veces para ver el ranking de crecimiento' 
                                    : 'Con un solo snapshot no podemos calcular crecimiento'}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* LEGACY LEADERBOARD - IMPACTO HISTORICO */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black mb-4 flex items-center gap-4">
                                👑 Salón de la Fama
                            </h2>
                            <p className="text-gray-500 max-w-xl">
                                Los artistas con el mayor impacto acumulado de la historia (vistas, reproducciones y seguidores totales). Aquí el tiempo es el mejor aliado.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {top10ByImpact.map((artist: any, index: number) => (
                            <a 
                                key={artist.id}
                                href={`/artist/${artist.slug}`}
                                className="group flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/10 hover:border-yellow-500/30 transition-all"
                            >
                                <div className="text-4xl font-black text-yellow-500/20 w-12 text-center group-hover:text-yellow-500/50 transition-colors">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-2xl mb-1">{artist.profile?.name || artist.name}</h3>
                                    <div className="flex gap-4 text-xs uppercase tracking-widest text-gray-500 font-bold">
                                        <span>{formatNumber(artist.currentMetrics?.youtube_views || 0)} views</span>
                                        <span>{formatNumber(artist.total)} fans</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-yellow-500">
                                        {formatNumber(artist.impact)}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500">puntos de impacto</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
                    <p>© 2026 RosarioHub - Rosario, Argentina</p>
                    <p>La plataforma de los músicos rosarinos</p>
                </div>
            </footer>
        </div>
    )
}
