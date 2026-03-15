'use client'

import { motion } from 'framer-motion'
import { Plus, Users, Zap, BarChart3, Globe, Music2, TrendingUp, Crown, Clock, Video, Camera, Radio } from 'lucide-react'
import { Artist, Snapshot } from '../types'

interface OverviewTabProps {
    artists: Artist[]
    stats: {
        totalArtists: number
        activeArtists: number
        avgRelevance: number
        totalFans: number
    }
    snapshots: Snapshot[]
    onCreateArtist: () => void
}

export function OverviewTab({ artists, stats, snapshots, onCreateArtist }: OverviewTabProps) {
    const lastSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp : null

    const platformStats = {
        spotify: artists.reduce((acc, a) => acc + (a.platforms?.spotify?.enabled ? 1 : 0), 0),
        youtube: artists.reduce((acc, a) => acc + (a.platforms?.youtube?.enabled ? 1 : 0), 0),
        instagram: artists.reduce((acc, a) => acc + (a.platforms?.instagram?.enabled ? 1 : 0), 0),
        tiktok: artists.reduce((acc, a) => acc + (a.platforms?.tiktok?.enabled ? 1 : 0), 0),
        soundcloud: artists.reduce((acc, a) => acc + (a.platforms?.soundcloud?.enabled ? 1 : 0), 0),
        twitter: artists.reduce((acc, a) => acc + (a.platforms?.twitter?.enabled ? 1 : 0), 0),
    }

    const totalPlatformsEnabled = platformStats.spotify + platformStats.youtube + platformStats.instagram + platformStats.tiktok

    const calculateRelevance = (metrics: any) => {
        const ytSubs = metrics?.youtube_subs || 0
        const ytViews = metrics?.youtube_views || 0
        const spotify = metrics?.spotify_monthly_listeners || 0
        const tiktok = metrics?.tiktok_followers || 0
        const instagram = metrics?.instagram_followers || 0
        const soundcloud = metrics?.soundcloud_followers || 0
        const twitter = metrics?.twitter_followers || 0
        
        const totalReach = ytSubs + spotify + tiktok + instagram + soundcloud + twitter
        const ytBonus = ytViews > 0 ? Math.log10(ytViews + 1) * 2 : 0
        
        return Math.round(totalReach + ytBonus)
    }

    const recentArtists = [...artists]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 5)

    const topRelevanceArtists = [...artists]
        .sort((a, b) => calculateRelevance(b.metrics) - calculateRelevance(a.metrics))
        .slice(0, 5)

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    const StatCard = ({ title, value, icon, color, subtitle }: { 
        title: string
        value: string | number
        icon: React.ReactNode
        color: string
        subtitle?: string
    }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-110 ${color.replace('bg-', 'bg-opacity-20 bg-')}`} />
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-3xl font-black text-gray-900 leading-tight">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
                </div>
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg`}>
                    <div className="text-white">{icon}</div>
                </div>
            </div>
        </motion.div>
    )

    const PlatformBar = ({ name, count, icon, color, total }: {
        name: string
        count: number
        icon: React.ReactNode
        color: string
        total: number
    }) => (
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-700">{name}</span>
                    <span className="text-sm font-black text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / total) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${color}`}
                    />
                </div>
            </div>
        </div>
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Resumen General</h2>
                    {lastSnapshot && (
                        <p className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Última actualización: {new Date(lastSnapshot).toLocaleString('es-AR')}
                        </p>
                    )}
                </div>
                <button
                    onClick={onCreateArtist}
                    className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 font-bold text-sm hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Artista
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                    title="Total Artistas"
                    value={stats.totalArtists}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-blue-500"
                    subtitle={`${stats.activeArtists} activos`}
                />
                <StatCard
                    title="Relevancia Promedio"
                    value={stats.avgRelevance}
                    icon={<Crown className="w-6 h-6" />}
                    color="bg-purple-500"
                    subtitle="puntos"
                />
                <StatCard
                    title="Alcance Total"
                    value={formatNumber(stats.totalFans)}
                    icon={<Globe className="w-6 h-6" />}
                    color="bg-orange-500"
                    subtitle="fans acumulados"
                />
                <StatCard
                    title="Tasa de Activos"
                    value={stats.totalArtists > 0 ? Math.round((stats.activeArtists / stats.totalArtists) * 100) : 0}
                    icon={<Zap className="w-6 h-6" />}
                    color="bg-green-500"
                    subtitle="%"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Adoption */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">Plataformas Activas</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Distribución del Ecosistema</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <PlatformBar 
                            name="Spotify" 
                            count={platformStats.spotify} 
                            icon={<Radio className="w-5 h-5" />}
                            color="bg-green-500"
                            total={stats.totalArtists}
                        />
                        <PlatformBar 
                            name="YouTube" 
                            count={platformStats.youtube} 
                            icon={<Video className="w-5 h-5" />}
                            color="bg-red-500"
                            total={stats.totalArtists}
                        />
                        <PlatformBar 
                            name="Instagram" 
                            count={platformStats.instagram} 
                            icon={<Camera className="w-5 h-5" />}
                            color="bg-pink-500"
                            total={stats.totalArtists}
                        />
                        <PlatformBar 
                            name="TikTok" 
                            count={platformStats.tiktok} 
                            icon={<Music2 className="w-5 h-5" />}
                            color="bg-cyan-500"
                            total={stats.totalArtists}
                        />
                        <PlatformBar 
                            name="SoundCloud" 
                            count={platformStats.soundcloud} 
                            icon={<Globe className="w-5 h-5" />}
                            color="bg-orange-500"
                            total={stats.totalArtists}
                        />
                        <PlatformBar 
                            name="Twitter/X" 
                            count={platformStats.twitter} 
                            icon={<TrendingUp className="w-5 h-5" />}
                            color="bg-gray-800"
                            total={stats.totalArtists}
                        />
                    </div>
                </div>

                {/* Top Artists by Relevance */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">Top Relevancia</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Artistas Mejor Rankeados</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {topRelevanceArtists.map((artist, index) => (
                            <motion.div 
                                key={artist.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                    index === 1 ? 'bg-gray-100 text-gray-600' :
                                    index === 2 ? 'bg-orange-100 text-orange-600' :
                                    'bg-gray-50 text-gray-400'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{artist.name || artist.profile?.name}</p>
                                    <p className="text-xs text-gray-400 font-medium">{artist.profile?.tagline || 'Sin tagline'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-purple-600">{calculateRelevance(artist.metrics).toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400">puntos</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Artists */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">Artistas Recientes</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Últimos Agregados al Hub</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentArtists.map((artist, index) => (
                        <motion.div
                            key={artist.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                                    {artist.profile?.profileImage ? (
                                        <img src={artist.profile.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Music2 className="w-6 h-6 text-purple-500" />
                                    )}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    artist.status === 'active' ? 'bg-green-100 text-green-700' :
                                    artist.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {artist.status === 'active' ? 'Activo' : 
                                     artist.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                                </span>
                            </div>
                            <h4 className="font-black text-gray-900 mb-1 truncate">{artist.name || artist.profile?.name}</h4>
                            <p className="text-xs text-gray-500 font-medium truncate">{artist.profile?.tagline}</p>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                {artist.platforms?.spotify?.enabled && (
                                    <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
                                        <Radio className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                {artist.platforms?.youtube?.enabled && (
                                    <div className="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center">
                                        <Video className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                {artist.platforms?.instagram?.enabled && (
                                    <div className="w-6 h-6 rounded-md bg-pink-500 flex items-center justify-center">
                                        <Camera className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
