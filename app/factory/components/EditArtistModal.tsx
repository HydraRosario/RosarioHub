'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Artist } from '../types'

interface EditArtistModalProps {
    artist: Artist
    onClose: () => void
    onSave: (artist: any) => Promise<boolean>
}

export function EditArtistModal({ artist, onClose, onSave }: EditArtistModalProps) {
    const [activeSection, setActiveSection] = useState<'profile' | 'platforms' | 'booking'>('profile')
    const [saving, setSaving] = useState(false)
    const [youtubeLoading, setYoutubeLoading] = useState(false)
    const [heroImageSource, setHeroImageSource] = useState<'youtube' | 'spotify' | 'manual'>((artist as any).heroImageSource || 'youtube')
    const [profileImageSource, setProfileImageSource] = useState<'youtube' | 'spotify' | 'manual'>((artist as any).profileImageSource || 'youtube')
    
    const [formData, setFormData] = useState({
        name: artist.profile?.name || artist.name || '',
        slug: artist.slug || '',
        tagline: artist.profile?.tagline || '',
        bio: artist.profile?.bio || '',
        heroImage: artist.profile?.heroImage || '',
        profileImage: artist.profile?.profileImage || '',
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
        // Social
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
        setSaving(true)
        
        console.log('artist.id:', artist.id)
        
        let heroImage = formData.heroImage
        let profileImage = formData.profileImage

        if (heroImageSource === 'youtube' && formData.youtube_channelId) {
            setYoutubeLoading(true)
            try {
                const response = await fetch(`/api/youtube?channelId=${formData.youtube_channelId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.bannerImage) heroImage = data.bannerImage
                }
            } catch (error) {
                console.error('Error fetching YouTube hero data:', error)
            } finally {
                setYoutubeLoading(false)
            }
        }

        if (heroImageSource === 'spotify' && formData.spotify_artistId) {
            try {
                const response = await fetch(`/api/spotify?artistId=${formData.spotify_artistId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.heroImage) heroImage = data.heroImage
                }
            } catch (error) {
                console.error('Error fetching Spotify hero data:', error)
            }
        }

        if (profileImageSource === 'youtube' && formData.youtube_channelId) {
            setYoutubeLoading(true)
            try {
                const response = await fetch(`/api/youtube?channelId=${formData.youtube_channelId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.profileImage) profileImage = data.profileImage
                }
            } catch (error) {
                console.error('Error fetching YouTube profile data:', error)
            } finally {
                setYoutubeLoading(false)
            }
        }

        if (profileImageSource === 'spotify' && formData.spotify_artistId) {
            try {
                const response = await fetch(`/api/spotify?artistId=${formData.spotify_artistId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.profileImage) profileImage = data.profileImage
                }
            } catch (error) {
                console.error('Error fetching Spotify profile data:', error)
            }
        }

        const validStatus = formData.status === 'active' || formData.status === 'pending' || formData.status === 'inactive' 
            ? formData.status as 'active' | 'pending' | 'inactive'
            : 'pending'
        
        console.log('Guardando artista:', { formDataStatus: formData.status, validStatus })
        
        const success = await onSave({
            ...artist,
            name: formData.name,
            slug: formData.slug,
            email: formData.email,
            theme: formData.theme,
            status: validStatus,
            heroImageSource: heroImageSource,
            profileImageSource: profileImageSource,
            profile: {
                name: formData.name,
                tagline: formData.tagline,
                bio: formData.bio,
                heroImage: heroImage || formData.heroImage,
                profileImage: profileImage || formData.profileImage
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
        if (success) {
            onClose()
        }
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
                    <h2 className="text-2xl font-bold text-gray-900">Editar Artista</h2>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fuente de Imagen Hero</label>
                                <select
                                    value={heroImageSource}
                                    onChange={(e) => setHeroImageSource(e.target.value as 'youtube' | 'spotify' | 'manual')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="youtube">YouTube</option>
                                    <option value="spotify">Spotify</option>
                                    <option value="manual">URL Manual</option>
                                </select>
                            </div>
                            {heroImageSource === 'manual' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                                <input
                                    type="url"
                                    value={formData.heroImage}
                                    onChange={(e) => setFormData({...formData, heroImage: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="https://..."
                                />
                            </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fuente de Imagen de Perfil</label>
                                <select
                                    value={profileImageSource}
                                    onChange={(e) => setProfileImageSource(e.target.value as 'youtube' | 'spotify' | 'manual')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="youtube">YouTube</option>
                                    <option value="spotify">Spotify</option>
                                    <option value="manual">URL Manual</option>
                                </select>
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
                            {/* Spotify */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <span className="font-bold flex items-center justify-between mb-2">Spotify 
                                    <input type="checkbox" checked={formData.spotify_enabled} onChange={e => setFormData({...formData, spotify_enabled: e.target.checked})} />
                                </span>
                                <input type="url" placeholder="Link" value={formData.social_spotify} onChange={e => setFormData({...formData, social_spotify: e.target.value})} className="w-full p-2 mb-2 border rounded text-sm" />
                                <input type="text" placeholder="ID" value={formData.spotify_artistId} onChange={e => setFormData({...formData, spotify_artistId: e.target.value})} className="w-full p-2 mb-2 border rounded text-sm" />
                                <textarea placeholder="Iframe" value={formData.spotify_iframe} onChange={e => setFormData({...formData, spotify_iframe: e.target.value})} className="w-full p-2 border rounded text-sm font-mono" rows={2} />
                            </div>
                            {/* YouTube */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <span className="font-bold flex items-center justify-between mb-2">YouTube 
                                    <input type="checkbox" checked={formData.youtube_enabled} onChange={e => setFormData({...formData, youtube_enabled: e.target.checked})} />
                                </span>
                                <input type="url" placeholder="Link" value={formData.social_youtube} onChange={e => setFormData({...formData, social_youtube: e.target.value})} className="w-full p-2 mb-2 border rounded text-sm" />
                                <input type="text" placeholder="Channel ID" value={formData.youtube_channelId} onChange={e => setFormData({...formData, youtube_channelId: e.target.value})} className="w-full p-2 mb-2 border rounded text-sm" />
                                <textarea placeholder="Iframe" value={formData.youtube_iframe} onChange={e => setFormData({...formData, youtube_iframe: e.target.value})} className="w-full p-2 border rounded text-sm font-mono" rows={2} />
                            </div>
                            {/* Instagram */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <span className="font-bold flex items-center justify-between mb-2">Instagram 
                                    <input type="checkbox" checked={formData.instagram_enabled} onChange={e => setFormData({...formData, instagram_enabled: e.target.checked})} />
                                </span>
                                <input type="url" placeholder="Link" value={formData.social_instagram} onChange={e => setFormData({...formData, social_instagram: e.target.value})} className="w-full p-2 mb-2 border rounded text-sm" />
                                <input type="text" placeholder="Username" value={formData.instagram_username} onChange={e => setFormData({...formData, instagram_username: e.target.value})} className="w-full p-2 border rounded text-sm" />
                            </div>
                            {/* TikTok */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <span className="font-bold flex items-center justify-between mb-2">TikTok 
                                    <input type="checkbox" checked={formData.tiktok_enabled} onChange={e => setFormData({...formData, tiktok_enabled: e.target.checked})} />
                                </span>
                                <input type="url" placeholder="Link" value={formData.social_tiktok} onChange={e => setFormData({...formData, social_tiktok: e.target.value})} className="w-full p-2 mb-2 border rounded text-sm" />
                                <input type="text" placeholder="Username" value={formData.tiktok_username} onChange={e => setFormData({...formData, tiktok_username: e.target.value})} className="w-full p-2 border rounded text-sm" />
                            </div>
                            {/* SoundCloud */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <span className="font-bold flex items-center justify-between mb-2">SoundCloud 
                                    <input type="checkbox" checked={formData.soundcloud_enabled} onChange={e => setFormData({...formData, soundcloud_enabled: e.target.checked})} />
                                </span>
                                <input type="url" placeholder="Link" value={formData.social_soundcloud} onChange={e => setFormData({...formData, social_soundcloud: e.target.value})} className="w-full p-2 mb-2 border rounded text-sm" />
                                <textarea placeholder="Iframe" value={formData.soundcloud_iframe} onChange={e => setFormData({...formData, soundcloud_iframe: e.target.value})} className="w-full p-2 border rounded text-sm font-mono" rows={2} />
                            </div>
                            {/* Twitter */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <span className="font-bold flex items-center justify-between mb-2">Twitter/X 
                                    <input type="checkbox" checked={formData.twitter_enabled} onChange={e => setFormData({...formData, twitter_enabled: e.target.checked})} />
                                </span>
                                <input type="url" placeholder="Link" value={formData.social_twitter} onChange={e => setFormData({...formData, social_twitter: e.target.value})} className="w-full p-2 border rounded text-sm" />
                            </div>
                        </div>
                    )}

                    {activeSection === 'booking' && (
                        <div className="space-y-4">
                            <input type="text" placeholder="WhatsApp" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-2 border rounded" />
                            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded" />
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" disabled={saving || youtubeLoading} className="px-4 py-2 bg-purple-600 text-white rounded">
                            {saving || youtubeLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
