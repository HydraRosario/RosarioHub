import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

function formatNumber(num: number): string {
    if (!num || num === 0) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

function calculateScore(metrics: any): number {
    let score = 0
    if (metrics.youtube_subs) score += Math.log10(metrics.youtube_subs + 1) * 0.9
    if (metrics.youtube_views) score += Math.log10(metrics.youtube_views + 1) * 0.85
    if (metrics.spotify_listeners) score += Math.log10(metrics.spotify_listeners + 1) * 1.0
    if (metrics.tiktok_followers) score += Math.log10(metrics.tiktok_followers + 1) * 0.7
    return Math.round(score * 100)
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

async function getLeaderboard() {
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
    const leaderboardData = await getLeaderboard()
    
    const activeArtists = artists.filter((a: any) => a.status === 'active')
    
    const artistsWithScores = activeArtists.map((artist: any) => {
        const snapshot = leaderboardData.snapshots?.find((s: any) => s.artistId === artist.id)
        const metrics = snapshot?.metrics || {}
        
        const totalScore = calculateScore(metrics)
        
        return {
            ...artist,
            metrics,
            score: totalScore,
            totalFollowers: (metrics.youtube_subs || 0) + 
                          (metrics.spotify_listeners || 0) + 
                          (metrics.tiktok_followers || 0)
        }
    })
    
    const sortedByScore = [...artistsWithScores].sort((a, b) => b.score - a.score)
    const top10 = sortedByScore.slice(0, 10)

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
            {/* Leaderboard Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                🏆 Top 10 Rosario
                            </h2>
                            <p className="text-gray-400">
                                Los artistas más influyentes de la ciudad
                                {leaderboardData.lastUpdate && (
                                    <span className="text-sm ml-2">
                                        (actualizado {new Date(leaderboardData.lastUpdate).toLocaleDateString('es-AR')})
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {top10.length > 0 ? (
                        <div className="grid gap-4">
                            {top10.map((artist: any, index: number) => (
                                <a 
                                    key={artist.id}
                                    href={`/artist/${artist.slug}`}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all ${
                                        index < 3 ? 'ring-1 ring-yellow-500/30' : ''
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
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
                                        <div className="text-2xl font-bold text-purple-400">
                                            {formatNumber(artist.totalFollowers)}
                                        </div>
                                        <div className="text-xs text-gray-500">seguidores</div>
                                    </div>
                                    
                                    {index < 3 && (
                                        <div className="text-3xl">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl mb-4">No hay artistas activos aún</p>
                            <p className="text-sm">¡Sé el primero en unirte!</p>
                        </div>
                    )}
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
