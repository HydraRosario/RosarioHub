'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Artist } from '../types'

interface CreateArtistModalProps {
    onClose: () => void
    onSave: (artist: Partial<Artist>) => void
}

export function CreateArtistModal({ onClose, onSave }: CreateArtistModalProps) {
    const [activeSection, setActiveSection] = useState<'profile' | 'platforms' | 'booking'>('profile')
    const [saving, setSaving] = useState(false)
    const [youtubeLoading, setYoutubeLoading] = useState(false)
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        tagline: '',
        bio: '',
        theme: 'SOFT_TRAP',
        status: 'active' as const,
        // Platforms
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
        // Social
        social_instagram: '',
        social_tiktok: '',
        social_youtube: '',
        social_spotify: '',
        social_soundcloud: '',
        social_twitter: '',
        // Booking
        whatsapp: '',
        whatsappMessage: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        
        let heroImage = '' 
        let profileImage = '' 

        if (formData.youtube_channelId) {
            setYoutubeLoading(true)
            try {
                const response = await fetch(`/api/youtube?channelId=${formData.youtube_channelId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.bannerImage) heroImage = data.bannerImage
                    if (data.profileImage) profileImage = data.profileImage
                }
            } catch (error) {
                console.error('Error fetching YouTube data:', error)
            } finally {
                setYoutubeLoading(false)
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
            },
            metrics: {
                youtube_subs: 0,
                youtube_views: 0,
                spotify_listeners: 0,
                instagram_followers: 0,
                tiktok_followers: 0,
                soundcloud_followers: 0,
                twitter_followers: 0,
                relevance_score: 0
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Artista</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                
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

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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
                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                        </>
                    )}
                    {activeSection === 'platforms' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Para cada plataforma: activala, poné el link y el iframe.</p>
                            
                            {/* Spotify */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">Spotify</span>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.spotify_enabled}
                                        onChange={(e) => setFormData({...formData, spotify_enabled: e.target.checked})}
                                        className="w-4 h-4 cursor-pointer"
                                    />
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
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Youtube */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">YouTube</span>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.youtube_enabled}
                                        onChange={(e) => setFormData({...formData, youtube_enabled: e.target.checked})}
                                        className="w-4 h-4 cursor-pointer"
                                    />
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
                                        placeholder="Channel ID"
                                        value={formData.youtube_channelId}
                                        onChange={(e) => setFormData({...formData, youtube_channelId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <textarea
                                        placeholder="Iframe"
                                        value={formData.youtube_iframe}
                                        onChange={(e) => setFormData({...formData, youtube_iframe: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Instagram */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold flex items-center gap-2">Instagram</span>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.instagram_enabled}
                                        onChange={(e) => setFormData({...formData, instagram_enabled: e.target.checked})}
                                        className="w-4 h-4 cursor-pointer"
                                    />
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
                                        placeholder="Username"
                                        value={formData.instagram_username}
                                        onChange={(e) => setFormData({...formData, instagram_username: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'booking' && (
                        <div className="space-y-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Booking</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving || youtubeLoading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            {saving || youtubeLoading ? 'Guardando...' : 'Crear Artista'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
