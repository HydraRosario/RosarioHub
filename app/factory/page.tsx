'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, TrendingUp, Music2, Youtube, Instagram, BarChart3, Globe, Zap, Eye, Edit, Trash2 } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
//  FACTORY DASHBOARD - Centro de Control de RosarioHub
//──────────────────────────────────────────────────────────────
interface PlatformConfig {
    artistId?: string
    channelId?: string
    channelHandle?: string
    videoId?: string
    username?: string
    iframe?: string
    enabled: boolean
}

interface Artist {
    id: string
    slug: string
    theme: string
    status: 'active' | 'pending' | 'inactive'
    profile: {
        name: string
        tagline: string
        bio: string
        heroImage: string
        profileImage: string
    }
    platforms: {
        spotify: PlatformConfig
        youtube: PlatformConfig
        instagram: PlatformConfig
        tiktok: PlatformConfig
        soundcloud: PlatformConfig
        twitter: PlatformConfig
    }
    social: {
        instagram: string
        tiktok: string
        youtube: string
        spotify: string
        soundcloud: string
        twitter: string
    }
    booking: {
        whatsapp: string
        whatsappMessage: string
        email: string
    }
    studio: {
        name: string
        url: string
        city: string
    }
    metrics: {
        spotify_listeners: number
        youtube_subs: number
        youtube_views: number
        instagram_followers: number
        tiktok_followers: number
        soundcloud_followers: number
        twitter_followers: number
        relevance_score: number
    }
    created_at: string
    // Campos de compatibilidad (deprecated - usar profile y social)
    name?: string
    email?: string
}

// Ya no usamos supabase, usamos nuestra propia API local


export default function FactoryDashboard() {
    const [artists, setArtists] = useState<Artist[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'artists' | 'analytics'>('overview')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null)

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

    const handleDeleteArtist = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este artista?')) return
        
        try {
            const response = await fetch(`/api/artists/${id}`, {
                method: 'DELETE'
            })
            
            if (response.ok) {
                setArtists(artists.filter(a => a.id !== id))
            } else {
                alert('Error al eliminar artista')
            }
        } catch (error) {
            console.error('Error al eliminar artista:', error)
            alert('Error al eliminar artista')
        }
    }

    const handleUpdateArtist = async (updatedArtist: Artist) => {
        try {
            const response = await fetch(`/api/artists/${updatedArtist.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedArtist)
            })
            
            if (response.ok) {
                const updated = await response.json()
                setArtists(artists.map(a => a.id === updated.id ? updated : a))
                setEditingArtist(null)
            } else {
                alert('Error al actualizar artista')
            }
        } catch (error) {
            console.error('Error al actualizar artista:', error)
            alert('Error al actualizar artista')
        }
    }

    // Stats generales
    const totalArtists = artists.length
    const activeArtists = artists.filter(a => a.status === 'active').length
    const totalRelevance = artists.reduce((sum, a) => sum + (a.metrics?.relevance_score || 0), 0)
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
                            <ArtistsTab 
                                artists={artists} 
                                onEdit={setEditingArtist}
                                onDelete={handleDeleteArtist}
                            />
                        )}
                        {activeTab === 'analytics' && (
                            <AnalyticsTab artists={artists} />
                        )}
                    </>
                )}
            </main>

            {/* Create Artist Modal */}
            {showCreateModal && (
                <CreateArtistModal 
                    onClose={() => setShowCreateModal(false)}
                    onSave={async (artist) => {
                        try {
                            const response = await fetch('/api/artists', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(artist)
                            })
                            
                            if (response.ok) {
                                const newArtist = await response.json()
                                setArtists([...artists, newArtist])
                                setShowCreateModal(false)
                            } else {
                                alert('Error al crear artista')
                            }
                        } catch (error) {
                            alert('Error conectando con la API: ' + error)
                        }
                    }}
                />
            )}

            {/* Edit Artist Modal */}
            {editingArtist && (
                <EditArtistModal 
                    artist={editingArtist}
                    onClose={() => setEditingArtist(null)}
                    onSave={handleUpdateArtist}
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
                                        <p className="text-sm text-gray-500">Relevance: {artist.metrics?.relevance_score || '-'}</p>
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
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────
//  ARTISTS TAB
//──────────────────────────────────────────────────────────────
function ArtistsTab({ artists, onEdit, onDelete }: { 
    artists: Artist[], 
    onEdit: (artist: Artist) => void
    onDelete: (id: string) => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">All Artists</h2>
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
                                        <span className="text-sm text-gray-900 mr-2">{artist.metrics?.relevance_score || '-'}</span>
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <a 
                                        href={`/artist/${artist.slug}`}
                                        target="_blank"
                                        className="text-purple-600 hover:text-purple-900 mr-3 flex items-center"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </a>
                                    <button 
                                        onClick={() => onEdit(artist)}
                                        className="text-gray-600 hover:text-gray-900 mr-3"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(artist.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
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
                            .sort((a, b) => (b.metrics?.relevance_score || 0) - (a.metrics?.relevance_score || 0))
                            .slice(0, 3)
                            .map((artist, index) => (
                                <div key={artist.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{artist.name}</p>
                                        <p className="text-xs text-gray-500">Relevance: {artist.metrics?.relevance_score || '-'}</p>
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
 //  CREATE ARTIST MODAL - Usa la misma estructura que EditArtistModal
 //──────────────────────────────────────────────────────────────
function CreateArtistModal({ onClose, onSave }: { 
    onClose: () => void, 
    onSave: (artist: Partial<Artist>) => void 
}) {
    const [activeSection, setActiveSection] = useState<'profile' | 'platforms' | 'booking'>('profile')
    const [saving, setSaving] = useState(false)
    
    const [formData, setFormData] = useState<{
        name: string
        tagline: string
        bio: string
        heroImage: string
        theme: string
        status: 'active' | 'pending' | 'inactive'
        spotify_enabled: boolean
        spotify_iframe: string
        spotify_artistId: string
        youtube_enabled: boolean
        youtube_iframe: string
        youtube_channelId: string
        instagram_enabled: boolean
        instagram_username: string
        tiktok_enabled: boolean
        tiktok_username: string
        soundcloud_enabled: boolean
        soundcloud_iframe: string
        twitter_enabled: boolean
        social_instagram: string
        social_tiktok: string
        social_youtube: string
        social_spotify: string
        social_soundcloud: string
        social_twitter: string
        whatsapp: string
        whatsappMessage: string
        email: string
    }>({
        name: '',
        tagline: '',
        bio: '',
        heroImage: '',
        theme: 'SOFT_TRAP',
        status: 'pending',
        spotify_enabled: false,
        spotify_iframe: '',
        spotify_artistId: '',
        youtube_enabled: false,
        youtube_iframe: '',
        youtube_channelId: '',
        instagram_enabled: false,
        instagram_username: '',
        tiktok_enabled: false,
        tiktok_username: '',
        soundcloud_enabled: false,
        soundcloud_iframe: '',
        twitter_enabled: false,
        social_instagram: '',
        social_tiktok: '',
        social_youtube: '',
        social_spotify: '',
        social_soundcloud: '',
        social_twitter: '',
        whatsapp: '',
        whatsappMessage: '',
        email: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        
        let heroImage = formData.heroImage
        let profileImage = ''

        if (formData.youtube_channelId) {
            try {
                const response = await fetch(`/api/youtube?channelId=${formData.youtube_channelId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.bannerImage) heroImage = data.bannerImage
                    if (data.profileImage) profileImage = data.profileImage
                }
            } catch (error) {
                console.error('Error fetching YouTube data:', error)
            }
        }

        const slug = formData.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
        
        onSave({
            name: formData.name,
            slug,
            email: formData.email,
            theme: formData.theme,
            status: formData.status,
            profile: {
                name: formData.name,
                tagline: formData.tagline,
                bio: formData.bio,
                heroImage: heroImage,
                profileImage: profileImage
            },
            platforms: {
                spotify: { iframe: formData.spotify_iframe, enabled: formData.spotify_enabled, artistId: formData.spotify_artistId },
                youtube: { iframe: formData.youtube_iframe, enabled: formData.youtube_enabled, channelId: formData.youtube_channelId },
                instagram: { enabled: formData.instagram_enabled, username: formData.instagram_username },
                tiktok: { enabled: formData.tiktok_enabled, username: formData.tiktok_username },
                soundcloud: { iframe: formData.soundcloud_iframe, enabled: formData.soundcloud_enabled },
                twitter: { enabled: formData.twitter_enabled }
            },
            social: {
                instagram: formData.social_instagram,
                tiktok: formData.social_tiktok,
                youtube: formData.social_youtube,
                spotify: formData.social_spotify,
                soundcloud: formData.social_soundcloud,
                twitter: formData.social_twitter
            },
            booking: {
                whatsapp: formData.whatsapp,
                whatsappMessage: formData.whatsappMessage,
                email: formData.email
            }
        })
        setSaving(false)
    }

    const sectionTabs = [
        { key: 'profile', label: 'Perfil' },
        { key: 'platforms', label: 'Plataformas' },
        { key: 'booking', label: 'Contacto' }
    ]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <motion.div 
                className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Crear Nuevo Artista</h2>
                
                <div className="flex border-b mb-4">
                    {sectionTabs.map(tab => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveSection(tab.key as any)}
                            className={`px-4 py-2 text-sm font-medium ${
                                activeSection === tab.key 
                                    ? 'text-purple-600 border-b-2 border-purple-600' 
                                    : 'text-gray-500'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {activeSection === 'profile' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Artista</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                                <input
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Trap from Rosario"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                                <select
                                    value={formData.theme}
                                    onChange={(e) => setFormData({...formData, theme: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="SOFT_TRAP">Soft Trap</option>
                                    <option value="BRUTALIST">Brutalist</option>
                                    <option value="PINK_GOTH">Pink Goth</option>
                                    <option value="INDIE_VIBE">Indie Vibe</option>
                                    <option value="TECHNO_MINIMAL">Techno</option>
                                    <option value="VAPORWAVE">Vaporwave</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </>
                    )}

                    {activeSection === 'platforms' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Para cada plataforma: activala, poné el link y el iframe.</p>
                            
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-green-500">🎵</span> Spotify
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.spotify_enabled}
                                            onChange={(e) => setFormData({...formData, spotify_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de artista"
                                        value={formData.social_spotify}
                                        onChange={(e) => setFormData({...formData, social_spotify: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Artist ID"
                                        value={formData.spotify_artistId}
                                        onChange={(e) => setFormData({...formData, spotify_artistId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <textarea
                                        placeholder="Iframe"
                                        value={formData.spotify_iframe}
                                        onChange={(e) => setFormData({...formData, spotify_iframe: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-red-500">▶️</span> YouTube
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.youtube_enabled}
                                            onChange={(e) => setFormData({...formData, youtube_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link del canal"
                                        value={formData.social_youtube}
                                        onChange={(e) => setFormData({...formData, social_youtube: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Channel ID (ej: UCdfZnZPCKjkzYAoU9NC3zCw)"
                                        value={formData.youtube_channelId}
                                        onChange={(e) => setFormData({...formData, youtube_channelId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <textarea
                                        placeholder="Iframe"
                                        value={formData.youtube_iframe}
                                        onChange={(e) => setFormData({...formData, youtube_iframe: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-pink-500">📸</span> Instagram
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.instagram_enabled}
                                            onChange={(e) => setFormData({...formData, instagram_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de perfil"
                                        value={formData.social_instagram}
                                        onChange={(e) => setFormData({...formData, social_instagram: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Username (sin @)"
                                        value={formData.instagram_username}
                                        onChange={(e) => setFormData({...formData, instagram_username: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-cyan-500">🎬</span> TikTok
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.tiktok_enabled}
                                            onChange={(e) => setFormData({...formData, tiktok_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de perfil"
                                        value={formData.social_tiktok}
                                        onChange={(e) => setFormData({...formData, social_tiktok: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Username (sin @)"
                                        value={formData.tiktok_username}
                                        onChange={(e) => setFormData({...formData, tiktok_username: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-orange-500">☁️</span> SoundCloud
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.soundcloud_enabled}
                                            onChange={(e) => setFormData({...formData, soundcloud_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de perfil"
                                        value={formData.social_soundcloud}
                                        onChange={(e) => setFormData({...formData, social_soundcloud: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <textarea
                                        placeholder="Iframe"
                                        value={formData.soundcloud_iframe}
                                        onChange={(e) => setFormData({...formData, soundcloud_iframe: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-black">🐦</span> X / Twitter
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.twitter_enabled}
                                            onChange={(e) => setFormData({...formData, twitter_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de perfil"
                                        value={formData.social_twitter}
                                        onChange={(e) => setFormData({...formData, social_twitter: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'booking' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="5493412345678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de WhatsApp</label>
                                <textarea
                                    value={formData.whatsappMessage}
                                    onChange={(e) => setFormData({...formData, whatsappMessage: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={2}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Booking</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Crear Artista'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
//  EDIT ARTIST MODAL
//──────────────────────────────────────────────────────────────
function EditArtistModal({ artist, onClose, onSave }: { 
    artist: Artist,
    onClose: () => void, 
    onSave: (artist: Artist) => void 
}) {
    const [activeSection, setActiveSection] = useState<'profile' | 'platforms' | 'booking'>('profile')
    
    const [formData, setFormData] = useState<{
        // Profile
        name: string
        tagline: string
        bio: string
        heroImage: string
        profileImage: string
        // Basic
        theme: string
        status: 'active' | 'pending' | 'inactive'
        // Platforms (link + enabled + IDs for metrics)
        spotify_enabled: boolean
        spotify_iframe: string
        spotify_artistId: string
        youtube_enabled: boolean
        youtube_iframe: string
        youtube_channelId: string
        instagram_enabled: boolean
        instagram_username: string
        tiktok_enabled: boolean
        tiktok_username: string
        soundcloud_enabled: boolean
        soundcloud_iframe: string
        twitter_enabled: boolean
        // Social URLs (links)
        social_instagram: string
        social_tiktok: string
        social_youtube: string
        social_spotify: string
        social_soundcloud: string
        social_twitter: string
        // Booking
        whatsapp: string
        whatsappMessage: string
        email: string
    }>({
        // Profile
        name: artist.profile?.name || artist.name || '',
        tagline: artist.profile?.tagline || '',
        bio: artist.profile?.bio || '',
        heroImage: artist.profile?.heroImage || '',
        profileImage: artist.profile?.profileImage || '',
        // Basic
        theme: artist.theme || 'SOFT_TRAP',
        status: artist.status || 'active',
        // Platforms
        spotify_enabled: artist.platforms?.spotify?.enabled || false,
        spotify_iframe: artist.platforms?.spotify?.iframe || '',
        spotify_artistId: artist.platforms?.spotify?.artistId || '',
        youtube_enabled: artist.platforms?.youtube?.enabled || false,
        youtube_iframe: artist.platforms?.youtube?.iframe || '',
        youtube_channelId: artist.platforms?.youtube?.channelId || '',
        instagram_enabled: artist.platforms?.instagram?.enabled || false,
        instagram_username: artist.platforms?.instagram?.username || '',
        tiktok_enabled: artist.platforms?.tiktok?.enabled || false,
        tiktok_username: artist.platforms?.tiktok?.username || '',
        soundcloud_enabled: artist.platforms?.soundcloud?.enabled || false,
        soundcloud_iframe: artist.platforms?.soundcloud?.iframe || '',
        twitter_enabled: artist.platforms?.twitter?.enabled || false,
        // Social URLs
        social_instagram: artist.social?.instagram || '',
        social_tiktok: artist.social?.tiktok || '',
        social_youtube: artist.social?.youtube || '',
        social_spotify: artist.social?.spotify || '',
        social_soundcloud: artist.social?.soundcloud || '',
        social_twitter: artist.social?.twitter || '',
        // Booking
        whatsapp: artist.booking?.whatsapp || '',
        whatsappMessage: artist.booking?.whatsappMessage || '',
        email: artist.booking?.email || artist.email || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        let heroImage = formData.heroImage
        let profileImage = formData.profileImage

        if (formData.youtube_channelId) {
            try {
                const response = await fetch(`/api/youtube?channelId=${formData.youtube_channelId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.bannerImage) heroImage = data.bannerImage
                    if (data.profileImage) profileImage = data.profileImage
                }
            } catch (error) {
                console.error('Error fetching YouTube data:', error)
            }
        }

        const validStatus = formData.status === 'active' || formData.status === 'pending' || formData.status === 'inactive' 
            ? formData.status as 'active' | 'pending' | 'inactive'
            : 'pending'
        
        onSave({
            ...artist,
            name: formData.name,
            email: formData.email,
            theme: formData.theme,
            status: validStatus,
            profile: {
                name: formData.name,
                tagline: formData.tagline,
                bio: formData.bio,
                heroImage: heroImage,
                profileImage: profileImage
            },
            platforms: {
                spotify: { iframe: formData.spotify_iframe, enabled: formData.spotify_enabled, artistId: formData.spotify_artistId },
                youtube: { iframe: formData.youtube_iframe, enabled: formData.youtube_enabled, channelId: formData.youtube_channelId },
                instagram: { enabled: formData.instagram_enabled, username: formData.instagram_username },
                tiktok: { enabled: formData.tiktok_enabled, username: formData.tiktok_username },
                soundcloud: { iframe: formData.soundcloud_iframe, enabled: formData.soundcloud_enabled },
                twitter: { enabled: formData.twitter_enabled }
            },
            social: {
                instagram: formData.social_instagram,
                tiktok: formData.social_tiktok,
                youtube: formData.social_youtube,
                spotify: formData.social_spotify,
                soundcloud: formData.social_soundcloud,
                twitter: formData.social_twitter
            },
            booking: {
                whatsapp: formData.whatsapp,
                whatsappMessage: formData.whatsappMessage,
                email: formData.email
            }
        })
    }

    const sectionTabs = [
        { key: 'profile', label: 'Perfil' },
        { key: 'platforms', label: 'Plataformas' },
        { key: 'booking', label: 'Contacto' }
    ]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <motion.div 
                className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Artista</h2>
                
                {/* Tabs */}
                <div className="flex border-b mb-4">
                    {sectionTabs.map(tab => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveSection(tab.key as any)}
                            className={`px-4 py-2 text-sm font-medium ${
                                activeSection === tab.key 
                                    ? 'text-purple-600 border-b-2 border-purple-600' 
                                    : 'text-gray-500'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* PROFILE SECTION */}
                    {activeSection === 'profile' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Artista</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                                <input
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Trap from Rosario"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                                <select
                                    value={formData.theme}
                                    onChange={(e) => setFormData({...formData, theme: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="SOFT_TRAP">Soft Trap</option>
                                    <option value="BRUTALIST">Brutalist</option>
                                    <option value="PINK_GOTH">Pink Goth</option>
                                    <option value="INDIE_VIBE">Indie Vibe</option>
                                    <option value="TECHNO_MINIMAL">Techno</option>
                                    <option value="VAPORWAVE">Vaporwave</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* PLATFORMS SECTION - SINGLE SECTION WITH LINK + IFRAME */}
                    {activeSection === 'platforms' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Para cada plataforma: activala, poné el link (se abre en nueva pestaña) y el iframe (se muestra en la página).</p>
                            
                            {/* Spotify */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-green-500">🎵</span> Spotify
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.spotify_enabled}
                                            onChange={(e) => setFormData({...formData, spotify_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de artista (https://open.spotify.com/intl-es/artist/...)"
                                        value={formData.social_spotify}
                                        onChange={(e) => setFormData({...formData, social_spotify: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Artist ID (ej: 4uPoJ3tuc56vh0w6ijU4cT)"
                                        value={formData.spotify_artistId}
                                        onChange={(e) => setFormData({...formData, spotify_artistId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <textarea
                                        placeholder="Iframe (copiá el código completo desde Spotify)"
                                        value={formData.spotify_iframe}
                                        onChange={(e) => setFormData({...formData, spotify_iframe: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* YouTube */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-red-500">▶️</span> YouTube
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.youtube_enabled}
                                            onChange={(e) => setFormData({...formData, youtube_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link del canal o video (https://youtube.com/...)"
                                        value={formData.social_youtube}
                                        onChange={(e) => setFormData({...formData, social_youtube: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Channel ID (ej: UCdfZnZPCKjkzYAoU9NC3zCw)"
                                        value={formData.youtube_channelId}
                                        onChange={(e) => setFormData({...formData, youtube_channelId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <textarea
                                        placeholder="Iframe (copiá el código completo desde YouTube)"
                                        value={formData.youtube_iframe}
                                        onChange={(e) => setFormData({...formData, youtube_iframe: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Instagram */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-pink-500">📸</span> Instagram
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.instagram_enabled}
                                            onChange={(e) => setFormData({...formData, instagram_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de perfil (https://instagram.com/...)"
                                        value={formData.social_instagram}
                                        onChange={(e) => setFormData({...formData, social_instagram: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Username (sin @)"
                                        value={formData.instagram_username}
                                        onChange={(e) => setFormData({...formData, instagram_username: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>

                            {/* TikTok */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-cyan-500">🎬</span> TikTok
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.tiktok_enabled}
                                            onChange={(e) => setFormData({...formData, tiktok_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de perfil (https://tiktok.com/...)"
                                        value={formData.social_tiktok}
                                        onChange={(e) => setFormData({...formData, social_tiktok: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Username (sin @)"
                                        value={formData.tiktok_username}
                                        onChange={(e) => setFormData({...formData, tiktok_username: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>

                            {/* SoundCloud */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-orange-500">☁️</span> SoundCloud
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.soundcloud_enabled}
                                            onChange={(e) => setFormData({...formData, soundcloud_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de perfil (https://soundcloud.com/...)"
                                        value={formData.social_soundcloud}
                                        onChange={(e) => setFormData({...formData, social_soundcloud: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <textarea
                                        placeholder="Iframe (código de embed de SoundCloud)"
                                        value={formData.soundcloud_iframe}
                                        onChange={(e) => setFormData({...formData, soundcloud_iframe: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Twitter/X */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">
                                        <span className="text-black">🐦</span> X / Twitter
                                    </span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.twitter_enabled}
                                            onChange={(e) => setFormData({...formData, twitter_enabled: e.target.checked})}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Activo</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Link de perfil (https://x.com/...)"
                                        value={formData.social_twitter}
                                        onChange={(e) => setFormData({...formData, social_twitter: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BOOKING SECTION */}
                    {activeSection === 'booking' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="5493412345678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de WhatsApp</label>
                                <textarea
                                    value={formData.whatsappMessage}
                                    onChange={(e) => setFormData({...formData, whatsappMessage: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={2}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Booking</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            Guardar
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
