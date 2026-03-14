import fs from 'fs'
import path from 'path'
import { Youtube, Users } from 'lucide-react'
import { calculateAnalytics, formatNumber, formatGrowth } from '../factory/utils/analytics'

export const dynamic = 'force-dynamic'


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

async function getSettings() {
    const settingsPath = path.join(process.cwd(), 'settings.json')
    try {
        const data = fs.readFileSync(settingsPath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return { leaderboard: { platforms: true, top10: true, growth: true, legacy: true } }
    }
}

export default async function LeaderboardPage() {
    const artists = await getArtists()
    const snapshotsData = await getSnapshots()
    const config = await getSettings()
    const settings = config.leaderboard
    
    const activeArtists = artists.filter((a: any) => a.status === 'active')
    const snapshots = snapshotsData.snapshots || []
    
    const analytics = calculateAnalytics(activeArtists, snapshots)
    
    // Map data to match existing template variable names
    const top10ByTotal = analytics.topPopularity.slice(0, 10).map(a => ({ ...a, total: a.currentTotal }))
    const top10ByGrowth = analytics.topGrowing.slice(0, 10).map(a => ({ ...a, total: a.currentTotal }))
    const top10ByImpact = analytics.topImpact.slice(0, 10).map(a => ({ ...a, total: a.currentTotal }))
    const platformStats = analytics.adoptionStats
    const globalTotalReach = analytics.globalTotalReach
    const systemReachHistory = analytics.systemReachHistory
    

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
            {/* GLOBAL ANALYTICS PREVIEW (Platforms) */}
            {settings.platforms && platformStats.length > 0 && (
                <section className="pt-20 pb-10 px-6 border-b border-white/5">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-sm uppercase tracking-[0.3em] text-purple-500 font-black mb-8 text-center">
                            Adopción de Plataformas
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

            {/* REACH HISTORY CHART */}
            {settings.reach && systemReachHistory.length > 0 && (
                <section className="py-20 px-6 bg-white/5 border-b border-white/5">
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-sm uppercase tracking-[0.3em] text-purple-400 font-black mb-12">
                            Alcance Total del Ecosistema
                        </h2>
                        <div className="h-48 flex items-end gap-1 mb-8 max-w-4xl mx-auto">
                            {systemReachHistory.map((point: any, i: number) => (
                                <div 
                                    key={i} 
                                    className="flex-1 bg-purple-500/20 hover:bg-purple-500 transition-all rounded-t-sm"
                                    style={{ height: `${(point.value / (Math.max(...systemReachHistory.map((p) => p.value)) || 1)) * 100}%` }}
                                    title={`${new Date(point.timestamp).toLocaleDateString()}: ${formatNumber(point.value)} Fans`}
                                />
                            ))}
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-5xl font-black text-white tracking-tighter mb-2">
                                {formatNumber(globalTotalReach)}
                            </div>
                            <div className="text-xs uppercase font-bold text-gray-500 tracking-widest">Fans conectados a RosarioHub</div>
                        </div>
                    </div>
                </section>
            )}

            {/* TOP 10 BY TOTAL METRICS */}
            {settings.top10 && (
                <section className="py-24 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 text-center md:text-left">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
                                    🏆 Top 10 Rosario
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    Los artistas con más alcance total en la ciudad
                                    {snapshotsData.lastUpdate && (
                                        <span className="text-sm ml-2 opacity-50 block md:inline font-mono">
                                            (actualizado {new Date(snapshotsData.lastUpdate).toLocaleDateString('es-AR')})
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {top10ByTotal.length > 0 ? (
                            <div className="grid gap-4">
                                {top10ByTotal.map((artist: any, index: number) => (
                                    <a 
                                        key={artist.id}
                                        href={`/artist/${artist.slug}`}
                                        className={`group flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all ${
                                            index < 3 ? 'ring-1 ring-yellow-500/20 bg-yellow-500/5' : ''
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl ${
                                            index === 0 ? 'bg-yellow-500 text-black' :
                                            index === 1 ? 'bg-gray-300 text-black' :
                                            index === 2 ? 'bg-amber-600 text-white' :
                                            'bg-white/10 text-gray-400'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-xl md:text-2xl truncate group-hover:text-purple-400 transition-colors">
                                                {artist.profile?.name || artist.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 truncate font-bold uppercase tracking-widest opacity-60">
                                                {artist.profile?.tagline || artist.theme}
                                            </p>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="text-2xl md:text-3xl font-black text-purple-400 tabular-nums">
                                                {formatNumber(artist.total)}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Total Fans</div>
                                        </div>
                                        
                                        {index < 3 && (
                                            <div className="text-3xl hidden md:block select-none opacity-50 group-hover:opacity-100 transition-opacity">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                            </div>
                                        )}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 text-gray-500">
                                <p className="text-2xl font-black mb-4">No hay datos aún 🌪️</p>
                                <p className="text-sm">Ejecuta el sincronizador para ver el ranking oficial</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {settings.growth && (
                <section className="py-24 px-6 bg-black/30 border-y border-white/5">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 text-center md:text-left">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
                                    📈 En Ascenso
                                </h2>
                                <p className="text-gray-400 text-lg">
                                    Los artistas que están marcando tendencia este mes
                                    {!snapshotsData.lastUpdate && (
                                        <span className="text-sm ml-2 text-yellow-500 font-bold uppercase">
                                            (se requieren más snapshots para precisión)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {top10ByGrowth.length > 0 && snapshots.length > 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {top10ByGrowth.map((artist: any, index: number) => (
                                    <a 
                                        key={artist.id}
                                        href={`/artist/${artist.slug}`}
                                        className="group flex flex-col p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all relative overflow-hidden shadow-2xl"
                                    >
                                        <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity select-none">
                                            <span className="text-9xl font-black">#{index + 1}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-2xl bg-green-500/20 text-green-400 border border-green-500/30`}>
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-xl group-hover:text-green-400 transition-colors truncate">
                                                    {artist.profile?.name || artist.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                                    {formatNumber(artist.total)} fans
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto flex items-end justify-between relative z-10">
                                            <div className={`text-4xl font-black tabular-nums ${
                                                artist.growth > 0 ? 'text-green-400' : 
                                                artist.growth < 0 ? 'text-red-400' : 'text-gray-400'
                                            }`}>
                                                {formatGrowth(artist.growth)}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-1.5 translate-y-2">
                                                Trend
                                            </div>
                                        </div>

                                        <div className="mt-6 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                                style={{ width: `${Math.min(100, Math.max(0, artist.growth))}%` }}
                                            />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 text-gray-500">
                                <p className="text-xl font-black mb-2 font-mono uppercase tracking-[0.3em]">Datos Insuficientes</p>
                                <p className="text-sm">Se necesitan al menos dos registros temporales para calcular el crecimiento</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {settings.legacy && (
                <section className="py-32 px-6 border-t border-white/5">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6 text-center md:text-left">
                            <div>
                                <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter flex items-center justify-center md:justify-start gap-4">
                                    👑 Salón de la Fama
                                </h2>
                                <p className="text-gray-500 text-xl max-w-2xl leading-relaxed font-medium">
                                    Artistas con el mayor impacto acumulado de la historia. Calculamos vistas, reproducciones y fans totales para medir la influencia real.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {top10ByImpact.map((artist: any, index: number) => (
                                <a 
                                    key={artist.id}
                                    href={`/artist/${artist.slug}`}
                                    className="group flex items-center gap-8 p-8 rounded-[2rem] bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/10 hover:border-yellow-500/30 transition-all shadow-xl"
                                >
                                    <div className="text-6xl font-black text-yellow-500/10 w-16 text-center group-hover:text-yellow-500/20 transition-colors select-none">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-2xl md:text-3xl mb-2 text-white group-hover:text-yellow-500 transition-colors truncate">
                                            {artist.profile?.name || artist.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                                            <span className="flex items-center gap-2">
                                                <Youtube className="w-3 h-3 text-red-500/50" />
                                                {formatNumber(artist.currentMetrics?.youtube_views || 0)} views
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Users className="w-3 h-3 text-purple-500/50" />
                                                {formatNumber(artist.total)} fans
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl md:text-4xl font-black text-yellow-500 tabular-nums tracking-tighter shadow-yellow-500/20">
                                            {formatNumber(artist.impact)}
                                        </div>
                                        <div className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-1">Impact Score</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 bg-black">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-gray-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                    <p>© 2026 RosarioHub — Rosario, Argentina</p>
                    <p className="hover:text-purple-500 transition-colors cursor-default">La vanguardia musical del interior</p>
                </div>
            </footer>
        </div>
    )
}
