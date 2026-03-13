'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, TrendingUp, Settings, Music2, Youtube, Instagram, BarChart3, Globe, Zap, Eye, Edit, Trash2 } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
//  FACTORY DASHBOARD - Centro de Control de RosarioHub
//──────────────────────────────────────────────────────────────
interface Artist {
    id: string
    name: string
    slug: string
    email: string
    status: 'active' | 'pending' | 'inactive'
    theme: string
    metrics: {
        spotify_listeners: number
        youtube_subs: number
        instagram_followers: number
        relevance_score: number
    }
    created_at: string
}

// Ya no usamos supabase, usamos nuestra propia API local


export default function FactoryDashboard() {
    const [artists, setArtists] = useState<Artist[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'artists' | 'analytics' | 'settings'>('overview')
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Carga de datos reales desde nuestro backend local (JSON)
    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const response = await fetch('/api/artists')
                const data = await response.json()
                setArtists(data)
            } catch (error) {
                console.error("Error al cargar artistas:", error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchArtists()
    }, [])

    // Stats generales
    const totalArtists = artists.length
    const activeArtists = artists.filter(a => a.status === 'active').length
    const totalRelevance = artists.reduce((sum, a) => sum + a.metrics.relevance_score, 0)
    const avgRelevance = totalArtists > 0 ? Math.round(totalRelevance / totalArtists) : 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Music2 className="w-8 h-8 text-purple-600 mr-3" />
                            <h1 className="text-2xl font-bold text-gray-900">RosarioHub Factory</h1>
                        </div>
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-3 py-2 text-sm font-medium ${
                                    activeTab === 'overview' 
                                        ? 'text-purple-600 border-b-2 border-purple-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('artists')}
                                className={`px-3 py-2 text-sm font-medium ${
                                    activeTab === 'artists' 
                                        ? 'text-purple-600 border-b-2 border-purple-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Artists
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-3 py-2 text-sm font-medium ${
                                    activeTab === 'analytics' 
                                        ? 'text-purple-600 border-b-2 border-purple-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-3 py-2 text-sm font-medium ${
                                    activeTab === 'settings' 
                                        ? 'text-purple-600 border-b-2 border-purple-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Settings
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <OverviewTab 
                                artists={artists}
                                stats={{ totalArtists, activeArtists, avgRelevance }}
                                onCreateArtist={() => setShowCreateModal(true)}
                            />
                        )}
                        {activeTab === 'artists' && (
                            <ArtistsTab artists={artists} />
                        )}
                        {activeTab === 'analytics' && (
                            <AnalyticsTab artists={artists} />
                        )}
                        {activeTab === 'settings' && (
                            <SettingsTab />
                        )}
                    </>
                )}
            </main>

            {/* Create Artist Modal */}
            {showCreateModal && (
                <CreateArtistModal 
                    onClose={() => setShowCreateModal(false)}
                    onSave={async (artist) => {
                        // Guardar en nuestra API local
                        try {
                            const response = await fetch('/api/artists', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    name: artist.name,
                                    slug: artist.slug?.toLowerCase().replace(/\s+/g, '-'),
                                    email: artist.email,
                                    theme: artist.theme
                                })
                            })
                            
                            if (response.ok) {
                                const newArtist = await response.json()
                                setArtists([...artists, newArtist])
                                setShowCreateModal(false)
                            } else {
                                alert('Error al crear artista en el archivo local')
                            }
                        } catch (error) {
                            alert('Error conectando con la API: ' + error)
                        }
                    }}
                />
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
//  OVERVIEW TAB
//──────────────────────────────────────────────────────────────
function OverviewTab({ artists, stats, onCreateArtist }: { 
    artists: Artist[], 
    stats: any, 
    onCreateArtist: () => void 
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Artists"
                    value={stats.totalArtists}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-blue-500"
                    change="+12%"
                    changeType="positive"
                />
                <StatCard
                    title="Active Artists"
                    value={stats.activeArtists}
                    icon={<Zap className="w-6 h-6" />}
                    color="bg-green-500"
                    change="+8%"
                    changeType="positive"
                />
                <StatCard
                    title="Avg Relevance"
                    value={stats.avgRelevance}
                    icon={<BarChart3 className="w-6 h-6" />}
                    color="bg-purple-500"
                    change="+15%"
                    changeType="positive"
                />
                <StatCard
                    title="Total Reach"
                    value="156K"
                    icon={<Globe className="w-6 h-6" />}
                    color="bg-orange-500"
                    change="+22%"
                    changeType="positive"
                />
            </div>

            {/* Recent Activity + CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {artists.slice(0, 3).map((artist, index) => (
                            <div key={artist.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                        <Music2 className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{artist.name}</p>
                                        <p className="text-sm text-gray-500">Relevance: {artist.metrics.relevance_score}</p>
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

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <button 
                            onClick={onCreateArtist}
                            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Artist
                        </button>
                        <button className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center font-medium">
                            <Settings className="w-5 h-5 mr-2" />
                            Configure Scanning
                        </button>
                        <button className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center font-medium">
                            <BarChart3 className="w-5 h-5 mr-2" />
                            Export Analytics
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────
//  ARTISTS TAB
//──────────────────────────────────────────────────────────────
function ArtistsTab({ artists }: { artists: Artist[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">All Artists</h2>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Artist
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Artist
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Relevance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subdomain
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {artists.map((artist) => (
                            <tr key={artist.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                            <Music2 className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                                            <div className="text-sm text-gray-500">{artist.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        artist.status === 'active' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {artist.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-900 mr-2">{artist.metrics.relevance_score}</span>
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {artist.slug}.rosariohub.com
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <a 
                                        href={`http://${artist.slug}.localhost:3000`}
                                        target="_blank"
                                        className="text-purple-600 hover:text-purple-900 mr-3 flex items-center"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </a>
                                    <button className="text-gray-600 hover:text-gray-900 mr-3">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────
//  ANALYTICS TAB
//──────────────────────────────────────────────────────────────
function AnalyticsTab({ artists }: { artists: Artist[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Music2 className="w-5 h-5 text-green-500 mr-2" />
                                <span className="text-sm text-gray-700">Spotify</span>
                            </div>
                            <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Youtube className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-sm text-gray-700">YouTube</span>
                            </div>
                            <span className="text-sm font-medium">30%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Instagram className="w-5 h-5 text-pink-500 mr-2" />
                                <span className="text-sm text-gray-700">Instagram</span>
                            </div>
                            <span className="text-sm font-medium">25%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                    <div className="space-y-3">
                        {artists
                            .sort((a, b) => b.metrics.relevance_score - a.metrics.relevance_score)
                            .slice(0, 3)
                            .map((artist, index) => (
                                <div key={artist.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{artist.name}</p>
                                        <p className="text-xs text-gray-500">Relevance: {artist.metrics.relevance_score}</p>
                                    </div>
                                    <div className="text-lg font-bold text-purple-600">#{index + 1}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────
//  SETTINGS TAB
//──────────────────────────────────────────────────────────────
function SettingsTab() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Factory Settings</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Theme
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                            <option>SOFT_TRAP</option>
                            <option>BRUTALIST</option>
                            <option>PINK_GOTH</option>
                            <option>INDIE_VIBE</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Auto-Scraping Interval
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                            <option>Every 5 minutes</option>
                            <option>Every 15 minutes</option>
                            <option>Every hour</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enable Gamification
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Enable leaderboards and achievements</span>
                        </label>
                    </div>
                    <div className="pt-4">
                        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────
//  CREATE ARTIST MODAL
//──────────────────────────────────────────────────────────────
function CreateArtistModal({ onClose, onSave }: { 
    onClose: () => void, 
    onSave: (artist: Partial<Artist>) => void 
}) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        email: '',
        theme: 'SOFT_TRAP'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
                className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Artist</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug (subdomain)</label>
                        <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="artist-name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select
                            value={formData.theme}
                            onChange={(e) => setFormData({...formData, theme: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="SOFT_TRAP">Soft Trap</option>
                            <option value="BRUTALIST">Brutalist</option>
                            <option value="PINK_GOTH">Pink Goth</option>
                            <option value="INDIE_VIBE">Indie Vibe</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            Create Artist
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
//  STAT CARD COMPONENT
//──────────────────────────────────────────────────────────────
function StatCard({ title, value, icon, color, change, changeType }: {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    change: string
    changeType: 'positive' | 'negative'
}) {
    return (
        <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <div className="text-white">{icon}</div>
                </div>
            </div>
            <div className={`mt-4 flex items-center text-sm ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {change} from last month
            </div>
        </motion.div>
    )
}
