'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Music2, Youtube, Instagram, Users, TrendingUp, Zap, Eye, EyeOff, Trophy, Star, TrendingUp as TrendingIcon, Crown } from 'lucide-react'
import { Artist, Snapshot } from '../types'

import { calculateAnalytics, getTotalFans, Settings, formatNumber, formatGrowth, ArtistWithStats } from '../utils/analytics'

interface AnalyticsTabProps {
    artists: Artist[]
    snapshots: Snapshot[]
}

export function AnalyticsTab({ artists, snapshots }: AnalyticsTabProps) {
    const [settings, setSettings] = useState<Settings | null>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' })
                if (res.ok) {
                    const data = await res.json()
                    setSettings(data)
                }
            } catch (error) {
                console.error('Error loading settings:', error)
            }
        }
        fetchSettings()
    }, [])

    const toggleLeaderboardSection = async (section: keyof Settings['leaderboard']) => {
        if (!settings) return
        
        const newSettings = {
            ...settings,
            leaderboard: {
                ...settings.leaderboard,
                [section]: !settings.leaderboard[section]
            }
        }
        
        setSettings(newSettings)
        
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            })
        } catch (error) {
            console.error('Error saving settings:', error)
        }
    }

    const { topPopularity, topGrowing, topImpact, systemReachHistory, adoptionStats, globalTotalReach } = useMemo(() => {
        const result = calculateAnalytics(artists, snapshots)
        return {
            ...result,
            topPopularity: result.topPopularity.slice(0, 10),
            topGrowing: result.topGrowing.slice(0, 10),
            topImpact: result.topImpact.slice(0, 10)
        }
    }, [artists, snapshots])

    const ToggleButton = ({ section }: { section: keyof Settings['leaderboard'] }) => {
        if (!settings) return <div className="p-2 w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
        const isActive = settings.leaderboard[section]
        return (
            <button 
                onClick={() => toggleLeaderboardSection(section)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
                    isActive 
                    ? 'bg-purple-100 text-purple-600 border border-purple-200' 
                    : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                }`}
            >
                {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {isActive ? 'Publicado' : 'Oculto'}
            </button>
        )
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 pb-20">
            {/* Row 1: Adoption & Global reach */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Platform Adoption */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-8 right-8 focus:outline-none z-10">
                        <ToggleButton section="platforms" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Adopción de Redes</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Conectividad del Ecosistema</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {adoptionStats.map((stat) => (
                            <div key={stat.platform}>
                                <div className="flex justify-between text-[10px] mb-2 text-gray-500 uppercase font-black tracking-widest">
                                    <span className="flex items-center gap-2">
                                        {stat.platform === 'spotify' && <Music2 className="w-3 h-3 text-green-500"/>}
                                        {stat.platform === 'youtube' && <Youtube className="w-3 h-3 text-red-500"/>}
                                        {stat.platform === 'instagram' && <Instagram className="w-3 h-3 text-pink-500"/>}
                                        {stat.platform}
                                    </span>
                                    <span>{stat.value} artistas ({stat.percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            stat.platform === 'spotify' ? 'bg-green-500' :
                                            stat.platform === 'youtube' ? 'bg-red-500' :
                                            stat.platform === 'instagram' ? 'bg-pink-500' :
                                            stat.platform === 'tiktok' ? 'bg-black' : 'bg-blue-600'
                                        }`}
                                        style={{ width: `${stat.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* General Reach Chart Integration */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-8 right-8 z-10">
                        <ToggleButton section="reach" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Alcance Total</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Crecimiento de la Red</p>
                        </div>
                    </div>
                    <div className="h-40 flex items-end gap-1 mb-6">
                        {systemReachHistory.map((point: { timestamp: string, value: number }, i: number) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-purple-500/10 hover:bg-purple-500 transition-all rounded-t-sm relative group/bar"
                                style={{ height: `${(point.value / (Math.max(...systemReachHistory.map((p) => p.value)) || 1)) * 100}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                    {formatNumber(point.value)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center pt-4 border-t border-gray-50">
                        <p className="text-3xl font-black text-purple-600 tracking-tighter">
                            {formatNumber(globalTotalReach)}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em]">Fans Acumulados</p>
                    </div>
                </div>
            </div>

            {/* Main Ranking Tables: Premium Style from Leaderboard */}
            <div className="grid grid-cols-1 gap-8">
                
                {/* 🏆 TOP 10 (POPULARITY) */}
                <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative">
                    <div className="absolute top-8 right-8">
                        <ToggleButton section="top10" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">Top Popularidad</h3>
                            <p className="text-sm text-gray-400 font-medium">Los artistas con más alcance total</p>
                        </div>
                    </div>
                    
                    <div className="grid gap-3">
                        {topPopularity.map((artist: ArtistWithStats, index: number) => (
                            <div 
                                key={artist.id}
                                className={`flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group transition-all hover:bg-gray-50 hover:border-purple-200 ${
                                    index < 3 ? 'ring-1 ring-yellow-500/10' : ''
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                                    index === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' :
                                    index === 1 ? 'bg-gray-300 text-gray-700' :
                                    index === 2 ? 'bg-amber-600 text-white' :
                                    'bg-white text-gray-400 border border-gray-200'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                                        {artist.profile?.name || artist.name}
                                    </h4>
                                    <p className="text-xs text-gray-400 truncate font-semibold uppercase tracking-wider">
                                        {artist.profile?.tagline || artist.theme}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-purple-600 leading-none mb-1">
                                        {formatNumber(artist.currentTotal)}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fans</div>
                                </div>
                                {index < 3 && (
                                    <div className="text-xl opacity-50">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 📈 GROWTH TABLE */}
                <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative">
                    <div className="absolute top-8 right-8">
                        <ToggleButton section="growth" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                            <TrendingIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">En Ascenso</h3>
                            <p className="text-sm text-gray-400 font-medium">Mayores tasas de crecimiento recientemente</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topGrowing.map((artist: ArtistWithStats, index: number) => (
                            <div 
                                key={artist.id}
                                className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:border-green-300 hover:bg-white transition-all relative overflow-hidden group shadow-sm hover:shadow-md"
                            >
                                <div className="absolute -top-2 -right-2 text-6xl font-black text-gray-100 group-hover:text-green-50 z-0 select-none">
                                    #{index + 1}
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 font-black">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-gray-900 truncate leading-tight group-hover:text-green-600">{artist.profile?.name || artist.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{formatNumber(artist.currentTotal)} fans</p>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className={`text-2xl font-black ${artist.growth > 0 ? 'text-green-500' : artist.growth < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {formatGrowth(artist.growth)}
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400 pb-1">Trend Rate</div>
                                    </div>
                                    <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, Math.max(0, artist.growth))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 👑 LEGACY TABLE */}
                <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative">
                    <div className="absolute top-8 right-8">
                        <ToggleButton section="legacy" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">Salón de la Fama</h3>
                            <p className="text-sm text-gray-400 font-medium">Mayor impacto histórico acumulado</p>
                        </div>
                    </div>
                    
                    <div className="grid gap-4">
                        {topImpact.map((artist: ArtistWithStats, index: number) => (
                            <div 
                                key={artist.id}
                                className="group flex items-center gap-6 p-6 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 hover:border-amber-300 hover:bg-white transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="text-4xl font-black text-amber-200/50 w-12 text-center group-hover:text-amber-500/30 transition-colors">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-xl mb-1 text-gray-900">{artist.profile?.name || artist.name}</h4>
                                    <div className="flex gap-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                        <span className="flex items-center gap-1"><Youtube className="w-3 h-3 text-red-500/50"/> {formatNumber(artist.metrics?.youtube_views || 0)} views</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3 text-purple-500/50"/> {formatNumber(artist.currentTotal)} fans</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-amber-600 tabular-nums">
                                        {formatNumber(artist.impact)}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Impact Score</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </motion.div>
    )
}
