'use client'

import { motion } from 'framer-motion'
import { Music2, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react'
import { Artist } from '../types'

interface ArtistsTabProps {
    artists: Artist[]
    onEdit: (artist: Artist) => void
    onDelete: (id: string) => void
}

const calculateRelevance = (metrics: any) => {
    const ytSubs = metrics?.youtube_subs || 0
    const ytViews = metrics?.youtube_views || 0
    const spotify = metrics?.spotify_listeners || 0
    const tiktok = metrics?.tiktok_followers || 0
    const instagram = metrics?.instagram_followers || 0
    const soundcloud = metrics?.soundcloud_followers || 0
    const twitter = metrics?.twitter_followers || 0
    
    const totalReach = ytSubs + spotify + tiktok + instagram + soundcloud + twitter
    const ytBonus = ytViews > 0 ? Math.log10(ytViews + 1) * 2 : 0
    
    return Math.round(totalReach + ytBonus)
}

export function ArtistsTab({ artists, onEdit, onDelete }: ArtistsTabProps) {
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
                                            <div className="text-sm font-medium text-gray-900">{artist.name || artist.profile?.name}</div>
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
                                        <span className="text-sm text-gray-900 mr-2">{calculateRelevance(artist.metrics).toLocaleString('es-AR')}</span>
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-3">
                                        <a 
                                            href={`/${artist.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-900 flex items-center"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </a>
                                        <button 
                                            onClick={() => onEdit(artist)}
                                            className="text-gray-600 hover:text-gray-900"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(artist.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}
