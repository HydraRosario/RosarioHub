import React from 'react'
import { Globe, Music2, Youtube, Instagram, Users, TrendingUp, Zap, Trophy, TrendingUp as TrendingIcon, Crown, Star } from 'lucide-react'
import { formatNumber, formatGrowth } from '../../utils/analytics'

export const getMetricBreakdown = (metricsTotals: any) => [
    { label: 'YouTube Views', value: metricsTotals?.youtube_views || 0, icon: <Youtube className="w-5 h-5 text-red-500" /> },
    { label: 'YouTube Subs', value: metricsTotals?.youtube_subs || 0, icon: <Youtube className="w-5 h-5 text-red-400" /> },
    { label: 'Instagram', value: metricsTotals?.instagram_followers || 0, icon: <Instagram className="w-5 h-5 text-pink-500" /> },
    { label: 'Spotify Monthly Listeners', value: metricsTotals?.spotify_monthly_listeners || 0, icon: <Music2 className="w-5 h-5 text-green-500" /> },
    { label: 'TikTok', value: metricsTotals?.tiktok_followers || 0, icon: <Music2 className="w-5 h-5" /> },
].filter(m => m.value > 0).sort((a, b) => b.value - a.value)

interface SectionProps {
    variant: 'factory' | 'leaderboard'
}

/* --- PLATFORM ADOPTION --- */
export const PlatformAdoptionDisplay = ({ stats, variant }: { stats: any[], variant: 'factory' | 'leaderboard' }) => {
    const isDark = variant === 'leaderboard'
    return (
        <div className={`grid ${isDark ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {stats.map((stat) => (
                <div key={stat.platform} className="flex flex-col items-center">
                    <div className={`${isDark ? 'text-2xl' : 'text-lg'} font-black ${isDark ? 'mb-1' : 'mb-0'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stat.percentage}%
                    </div>
                    <div className={`text-[8px] uppercase font-bold tracking-widest ${isDark ? 'mb-3' : 'mb-2'} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {stat.platform}
                    </div>
                    <div className={`w-full max-w-[100px] h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <div 
                            className={`h-full transition-all duration-1000 ${
                                stat.platform === 'spotify' ? 'bg-green-500' :
                                stat.platform === 'youtube' ? 'bg-red-500' :
                                stat.platform === 'instagram' ? 'bg-pink-500' :
                                stat.platform === 'tiktok' ? (isDark ? 'bg-white' : 'bg-black') : 'bg-blue-600'
                            }`}
                            style={{ width: `${stat.percentage}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

/* --- REACH METRICS --- */
export const ReachMetricsDisplay = ({ metrics, globalTotal, variant }: { metrics: any[], globalTotal: number, variant: 'factory' | 'leaderboard' }) => {
    const isDark = variant === 'leaderboard'
    return (
        <div className={`space-y-3 ${isDark ? 'max-w-4xl' : ''} mx-auto w-full`}>
            <div className={`grid ${isDark ? 'grid-cols-1' : 'grid-cols-2'} ${isDark ? 'gap-3' : 'gap-2'}`}>
                {metrics.map((m, idx) => (
                    <div 
                        key={idx} 
                        className={`${isDark ? 'p-5' : 'p-2.5'} rounded-2xl border flex items-center ${isDark ? 'gap-6' : 'gap-3'} transition-all group ${
                            isDark 
                            ? 'bg-white/5 border-white/5 hover:bg-white/[0.08]' 
                            : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        <div className={`${isDark ? 'w-12 h-12 rounded-2xl' : 'w-9 h-9 rounded-xl'} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                            {React.cloneElement(m.icon as React.ReactElement<any>, { className: isDark ? 'w-6 h-6' : 'w-4 h-4' })}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <span className={`text-[8px] font-black uppercase tracking-widest block ${isDark ? 'mb-0.5' : 'mb-0'} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {m.label.split(' ')[0]}
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                <span className={`${isDark ? 'text-3xl' : 'text-lg'} font-black leading-tight tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {formatNumber(m.value)}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {m.label.split(' ')[1] || 'Fans'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className={`${isDark ? 'mt-12 pt-10' : 'mt-4 pt-4'} text-center border-t border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className={`${isDark ? 'text-5xl' : 'text-3xl'} font-black tracking-tighter mb-0.5 ${isDark ? 'text-white' : 'text-purple-600'}`}>
                    {formatNumber(globalTotal)}
                </div>
                <p className={`text-[8px] uppercase font-bold tracking-[0.4em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Fans Totales Rosario Hub
                </p>
            </div>
        </div>
    )
}

/* --- RANKING LIST --- */
export const RankingListDisplay = ({ title, icon, data, type, variant, colors }: { 
    title: string, 
    icon: React.ReactNode, 
    data: any[], 
    type: 'total' | 'growth' | 'impact', 
    variant: 'factory' | 'leaderboard' | 'hall-of-fame' | 'spotify-top',
    colors?: any
}) => {
    const isDark = variant === 'leaderboard'
    const isHallOfFame = variant === 'hall-of-fame'
    const isSpotifyTop = variant === 'spotify-top'
    
    // Usar colores centralizados o fallback
    const getColor = (key: string, fallback: string) => {
        if (colors?.[key]) return isDark ? colors[key + 'Dark'] || colors[key] : colors[key]
        return fallback
    }
    
    return (
        <div className="w-full">
            <div className="flex items-center gap-4 mb-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    getColor('icon', isDark ? 'bg-white/10 text-purple-400 shadow-purple-500/20' : 'bg-purple-50 text-purple-600 shadow-purple-200')
                }`}>
                    {icon}
                </div>
                <div className="text-left">
                    <h3 className={`text-2xl font-black tracking-tight leading-tight ${
                        isSpotifyTop ? getColor('title', isDark ? 'text-green-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700') :
                        isHallOfFame ? getColor('title', isDark ? 'text-yellow-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-700') :
                        getColor('title', isDark ? 'text-white' : 'text-gray-900')
                    }`}>
                        {title}
                    </h3>
                    <p className={`text-[10px] uppercase font-bold tracking-widest ${
                        getColor('subtitle', isDark ? 'text-gray-400' : 'text-gray-500')
                    }`}>
                        {type === 'total' ? (isSpotifyTop ? 'Basado en Oyentes Mensuales' : 'Basado en Fans Totales') : type === 'growth' ? 'Crecimiento Porcentual' : 'Score de Impacto Global'}
                    </p>
                </div>
            </div>
            
            <div className="space-y-3">
                {data.map((artist, idx) => {
                    // Usar 'a' para cualquier variante de leaderboard (leaderboard, hall-of-fame, spotify-top)
                    const isLeaderboardVariant = variant === 'leaderboard' || variant === 'hall-of-fame' || variant === 'spotify-top'
                    const Wrapper = isLeaderboardVariant ? 'a' : 'div'
                    const extraProps = isLeaderboardVariant ? { 
                        href: `/${artist.slug}`, 
                        target: "_blank", 
                        rel: "noopener noreferrer" 
                    } : {}

                    return (
                        <Wrapper 
                            key={artist.slug || artist.id} 
                            {...extraProps}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                                getColor('card', isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.08]' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-md')
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                                idx === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' :
                                idx === 1 ? (isDark ? 'bg-gray-400 text-black' : 'bg-gray-300 text-gray-700') :
                                idx === 2 ? (isDark ? 'bg-amber-700 text-white' : 'bg-amber-600 text-white') :
                                (isDark ? 'bg-white/5 text-gray-400 border border-white/5' : 'bg-white text-gray-400 border border-gray-200')
                            }`}>
                            {idx + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0 text-left">
                            <h4 className={`font-black truncate group-hover:text-purple-500 transition-colors ${
                                getColor('name', isDark ? 'text-white' : 'text-gray-900')
                            }`}>
                                {artist.profile?.name || artist.name}
                            </h4>
                            <p className={`text-[10px] uppercase font-bold tracking-wider truncate shrink-0 ${
                                getColor('tagline', isDark ? 'text-gray-500' : 'text-gray-400')
                            }`}>
                                {artist.profile?.tagline || artist.theme || 'Músico'}
                            </p>
                        </div>
                        
                        <div className="text-right shrink-0">
                            {type === 'growth' ? (
                                <div className={`text-lg font-black ${
                                    artist.growth > 0 ? 'text-green-500' : artist.growth < 0 ? 'text-red-500' : 'text-gray-400'
                                }`}>
                                    {formatGrowth(artist.growth)}
                                </div>
                            ) : (
                                <div className={`text-lg font-black ${
                                    getColor('value', isDark ? 'text-white' : 'text-gray-900')
                                }`}>
                                    {formatNumber(isSpotifyTop ? artist.spotifyTotal : (type === 'impact' ? artist.impact : artist.currentTotal))}
                                </div>
                            )}
                            <div className={`text-[9px] font-bold uppercase tracking-tighter ${
                                getColor('label', isDark ? 'text-gray-400' : 'text-gray-500')
                            }`}>
                                {type === 'total' ? (isSpotifyTop ? 'Oyentes' : 'Fans') : type === 'growth' ? 'Trend' : 'Score'}
                            </div>
                        </div>
                        </Wrapper>
                    )
                })}
            </div>
        </div>
    )
}
