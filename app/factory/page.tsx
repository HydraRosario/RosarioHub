'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Globe, Zap, History, RefreshCw } from 'lucide-react'

// Modularized Components
import { OverviewTab } from './components/OverviewTab'
import { ArtistsTab } from './components/ArtistsTab'
import { AnalyticsTab } from './components/AnalyticsTab'
import { CreateArtistModal } from './components/CreateArtistModal'
import { EditArtistModal } from './components/EditArtistModal'

// Types
import { Artist, Snapshot } from './types'

export default function FactoryDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'artists' | 'analytics' | 'history'>('overview')
    const [artists, setArtists] = useState<Artist[]>([])
    const [snapshots, setSnapshots] = useState<Snapshot[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editArtist, setEditArtist] = useState<Artist | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [artistsRes, snapshotsRes] = await Promise.all([
                fetch('/api/artists'),
                fetch('/api/snapshots')
            ])
            const artistsData = await artistsRes.json()
            const snapshotsData = await snapshotsRes.json()
            setArtists(artistsData)
            setSnapshots(snapshotsData.snapshots || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async () => {
        setSyncing(true)
        try {
            await fetch('/api/snapshots', { method: 'POST' })
            await fetchData()
        } catch (error) {
            console.error('Error syncing:', error)
        } finally {
            setSyncing(false)
        }
    }

    const handleCreateArtist = async (artistData: Partial<Artist>): Promise<boolean> => {
        try {
            const res = await fetch('/api/artists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(artistData)
            })
            if (res.ok) {
                setShowCreateModal(false)
                fetchData()
                return true
            }
            return false
        } catch (error) {
            console.error('Error creating artist:', error)
            return false
        }
    }

    const handleUpdateArtist = async (updatedArtist: Artist): Promise<boolean> => {
        console.log('handleUpdateArtist llamado con:', updatedArtist)
        try {
            const res = await fetch(`/api/artists/${updatedArtist.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedArtist)
            })
            console.log('Respuesta:', res.status, res.ok)
            if (res.ok) {
                setEditArtist(null)
                fetchData()
                return true
            }
            return false
        } catch (error) {
            console.error('Error updating artist:', error)
            return false
        }
    }

    const handleDeleteArtist = async (id: string) => {
        if (!confirm('Are you sure you want to delete this artist?')) return
        try {
            const res = await fetch(`/api/artists/${id}`, { method: 'DELETE' })
            if (res.ok) fetchData()
        } catch (error) {
            console.error('Error deleting artist:', error)
        }
    }

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

    const stats = useMemo(() => {
        const totalFans = artists.reduce((acc, a) => 
            acc + (a.metrics?.youtube_subs || 0) + (a.metrics?.spotify_monthly_listeners || 0) + (a.metrics?.tiktok_followers || 0) + (a.metrics?.instagram_followers || 0), 0)
        
        const totalRelevance = artists.reduce((acc, a) => acc + calculateRelevance(a.metrics), 0)
        
        return {
            totalArtists: artists.length,
            activeArtists: artists.filter(a => a.status === 'active').length,
            avgRelevance: artists.length ? Math.round(totalRelevance / artists.length) : 0,
            totalFans
        }
    }, [artists])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Sidebar Sim */}
            <div className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-black text-purple-600 tracking-tighter uppercase mr-8">Factory <span className="text-gray-900">Hub</span></h1>
                            <nav className="flex space-x-8">
                                <button onClick={() => setActiveTab('overview')} className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Overview</button>
                                <button onClick={() => setActiveTab('artists')} className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'artists' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Artists</button>
                                <button onClick={() => setActiveTab('analytics')} className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Analytics</button>
                            </nav>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleSync}
                                disabled={syncing}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold"
                            >
                                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                                {syncing ? 'Goteando...' : 'Sync Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <OverviewTab 
                        artists={artists} 
                        stats={stats} 
                        snapshots={snapshots} 
                        onCreateArtist={() => setShowCreateModal(true)} 
                    />
                )}
                {activeTab === 'artists' && (
                    <ArtistsTab 
                        artists={artists} 
                        onEdit={setEditArtist} 
                        onDelete={handleDeleteArtist} 
                    />
                )}
                {activeTab === 'analytics' && (
                    <AnalyticsTab 
                        artists={artists} 
                        snapshots={snapshots} 
                    />
                )}
            </main>

            {/* Modals */}
            {showCreateModal && (
                <CreateArtistModal 
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreateArtist}
                />
            )}
            {editArtist && (
                <EditArtistModal 
                    artist={editArtist}
                    onClose={() => setEditArtist(null)}
                    onSave={handleUpdateArtist}
                />
            )}
        </div>
    )
}
