import fs from 'fs'
import path from 'path'
import { Trophy, TrendingUp, Zap } from 'lucide-react'
import { calculateAnalytics } from '../factory/utils/analytics'
import { 
    PlatformAdoptionDisplay, 
    ReachMetricsDisplay, 
    RankingListDisplay, 
    getMetricBreakdown 
} from '../factory/components/shared/AnalyticsDisplay'

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
        return { leaderboard: { platforms: true, top10: true, growth: true, legacy: true, reach: true } }
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
    
    const metricBreakdown = getMetricBreakdown(analytics.metricsTotals)
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white pb-32">
            <div className="max-w-6xl mx-auto px-6">
                
                {/* 1. PLATFORM ADOPTION */}
                {settings.platforms && (
                    <section className="py-24 border-b border-white/5">
                        <h2 className="text-sm uppercase tracking-[0.4em] text-purple-500 font-black mb-16 text-center">
                            Adopción de Plataformas
                        </h2>
                        <PlatformAdoptionDisplay stats={analytics.adoptionStats} variant="leaderboard" />
                    </section>
                )}

                {/* 2. REACH METRICS (STACKED) */}
                {settings.reach && (
                    <section className="py-24 border-b border-white/5">
                        <ReachMetricsDisplay 
                            metrics={metricBreakdown} 
                            globalTotal={analytics.globalTotalReach} 
                            variant="leaderboard" 
                        />
                    </section>
                )}

                {/* 3. RANKINGS */}
                <div className="space-y-32 py-24">
                    {settings.top10 && (
                        <RankingListDisplay 
                            title="Top 10 Rosario" 
                            icon={<Trophy className="w-8 h-8" />} 
                            data={analytics.topPopularity.slice(0, 10)} 
                            type="total" 
                            variant="leaderboard" 
                        />
                    )}

                    {settings.growth && (
                        <RankingListDisplay 
                            title="Ranking Crecimiento" 
                            icon={<TrendingUp className="w-8 h-8" />} 
                            data={analytics.topGrowing.slice(0, 10)} 
                            type="growth" 
                            variant="leaderboard" 
                        />
                    )}

                    {settings.legacy && (
                        <RankingListDisplay 
                            title="Ranking Impacto" 
                            icon={<Zap className="w-8 h-8" />} 
                            data={analytics.topImpact.slice(0, 10)} 
                            type="impact" 
                            variant="leaderboard" 
                        />
                    )}
                </div>

                {snapshotsData.lastUpdate && (
                    <div className="mt-20 text-center text-gray-600 text-[10px] uppercase font-bold tracking-[0.3em]">
                        Última actualización: {new Date(snapshotsData.lastUpdate).toLocaleString('es-AR')}
                    </div>
                )}
            </div>
        </div>
    )
}
