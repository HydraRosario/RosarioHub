'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Youtube, Instagram, Music2, TrendingUp, Zap, Trophy, Crown, Eye, EyeOff } from 'lucide-react'
import { Artist, Snapshot } from '../types'
import { calculateAnalytics, Settings } from '../utils/analytics'
import { 
    PlatformAdoptionDisplay, 
    ReachMetricsDisplay, 
    RankingListDisplay, 
    getMetricBreakdown 
} from './shared/AnalyticsDisplay'

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

    const { 
        topPopularity, 
        topGrowing, 
        topImpact, 
        adoptionStats, 
        globalTotalReach, 
        metricsTotals 
    } = useMemo(() => {
        const result = calculateAnalytics(artists, snapshots)
        return {
            ...result,
            topPopularity: result.topPopularity.slice(0, 10),
            topGrowing: result.topGrowing.slice(0, 10),
            topImpact: result.topImpact.slice(0, 10)
        }
    }, [artists, snapshots])

    const metricBreakdown = useMemo(() => getMetricBreakdown(metricsTotals), [metricsTotals])

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
            {/* REACH */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-6 right-6 z-10">
                        <ToggleButton section="reach" />
                    </div>
                    <div className="flex items-center gap-4 mb-6 text-left">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">Alcance Rosario Hub</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Métricas Globales Acumuladas</p>
                        </div>
                    </div>
                    <ReachMetricsDisplay metrics={metricBreakdown} globalTotal={globalTotalReach} variant="factory" />
                </div>
            </div>

            {/* RANKINGS */}
            <div className="grid grid-cols-1 gap-8">
                <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-8 right-8">
                        <ToggleButton section="top10" />
                    </div>
                    <RankingListDisplay title="Ranking Popularidad" icon={<Trophy className="w-6 h-6" />} data={topPopularity} type="total" variant="factory" />
                </section>

                <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-10 right-10">
                        <ToggleButton section="growth" />
                    </div>
                    <RankingListDisplay title="Ranking Crecimiento" icon={<TrendingUp className="w-6 h-6" />} data={topGrowing} type="growth" variant="factory" />
                </section>

                <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-10 right-10">
                        <ToggleButton section="legacy" />
                    </div>
                    <RankingListDisplay title="Ranking Impacto Rosario" icon={<Zap className="w-6 h-6" />} data={topImpact} type="impact" variant="factory" />
                </section>
            </div>
        </motion.div>
    )
}
