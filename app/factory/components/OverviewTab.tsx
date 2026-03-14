'use client'

import { motion } from 'framer-motion'
import { Plus, Users, Zap, BarChart3, Globe, Music2 } from 'lucide-react'
import { StatCard } from './StatCard'
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Resumen General</h2>
                    {lastSnapshot && (
                        <p className="text-xs text-gray-500 font-medium">Última actualización: {new Date(lastSnapshot).toLocaleString('es-AR')}</p>
                    )}
                </div>
                <button
                    onClick={onCreateArtist}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-bold text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Artista
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Artists"
                    value={stats.totalArtists}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Artists"
                    value={stats.activeArtists}
                    icon={<Zap className="w-6 h-6" />}
                    color="bg-green-500"
                />
                <StatCard
                    title="Avg Relevance"
                    value={stats.avgRelevance.toLocaleString('es-AR')}
                    icon={<BarChart3 className="w-6 h-6" />}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Fans Reach"
                    value={stats.totalFans.toLocaleString('es-AR')}
                    icon={<Globe className="w-6 h-6" />}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Activity + CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {artists.slice(0, 3).map((artist) => (
                            <div key={artist.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                        <Music2 className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{artist.name || artist.profile?.name}</p>
                                        <p className="text-sm text-gray-500">Relevance: {artist.metrics?.relevance_score?.toLocaleString('es-AR') || '-'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        artist.status === 'active' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {artist.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
