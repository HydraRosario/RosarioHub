'use client'

import { motion } from 'framer-motion'
import { Instagram, Youtube, Music2, MessageCircle, Mail, TrendingUp, Zap, MapPin, Play, ExternalLink, Twitter, Cloud, RefreshCw } from 'lucide-react'
import { useTheme } from '../themeEngine'
import { MetricData } from '../factory/types'

// TrendChart Inline - 15 lines minimal version
function TrendChart({ data, height = 40 }: { data: { value: number }[], height?: number }) {
    if (!data || data.length < 2) return null
    const values = data.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ')
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <polyline fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} className="text-purple-500/50" />
        </svg>
    )
}

interface Profile {
    name: string
    tagline?: string
    bio?: string
    heroImageUrl?: string
    profileImage?: string
    youtubeProfileImage?: string
    youtubeHeroImage?: string
    spotifyProfileImage?: string
    uploadedHeroImage?: string
    uploadedProfileImage?: string
}

export function DynamicHero({ profile, metrics, history, lastUpdated, heroImageSource, profileImageSource }: { 
    profile: Profile, 
    metrics: MetricData[],
    history?: Record<string, {timestamp: string, value: number}[]>,
    lastUpdated?: string | null
    heroImageSource?: 'youtube_banner' | 'youtube_profile' | 'spotify_profile' | 'upload'
    profileImageSource?: 'youtube_banner' | 'youtube_profile' | 'spotify_profile' | 'upload'
}) {
    const { classes } = useTheme()
    
    // Determine hero image based on source
    const getHeroImage = () => {
        if (heroImageSource === 'upload') {
            return profile.uploadedHeroImage || ''
        }
        if (heroImageSource === 'spotify_profile') {
            return profile.spotifyProfileImage || ''
        }
        if (heroImageSource === 'youtube_banner') {
            return profile.youtubeHeroImage || ''
        }
        if (heroImageSource === 'youtube_profile') {
            return profile.youtubeProfileImage || ''
        }
        return profile.heroImageUrl || ''
    }
    
    // Determine profile image based on source
    const getProfileImage = () => {
        if (profileImageSource === 'upload') {
            return profile.profileImage || ''
        }
        if (profileImageSource === 'spotify_profile') {
            return profile.spotifyProfileImage || ''
        }
        if (profileImageSource === 'youtube_banner') {
            return profile.youtubeHeroImage || ''
        }
        if (profileImageSource === 'youtube_profile') {
            return profile.youtubeProfileImage || ''
        }
        return ''
    }
    
    // Show ALL metrics sorted by value (highest first!)
    const displayMetrics = metrics?.length > 0 ? metrics : []
    
    return (
        <section 
            className="relative min-h-screen flex flex-col justify-end pb-16 overflow-hidden"
        >
            {getHeroImage() && (
                <div 
                    className="absolute inset-0 -z-10"
                    style={{ 
                        backgroundImage: `url(${getHeroImage()})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        filter: 'blur(2px)'
                    }}
                />
            )}
            <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="container mx-auto relative z-10 flex flex-col items-center text-center px-4">
                <div className="mb-8 flex items-center gap-4">
                    <div className={`px-4 py-1.5 border border-white/20 text-xs font-bold tracking-widest uppercase text-white/80 backdrop-blur-md ${classes.badge || 'rounded-full'}`}>
                        <MapPin className="inline w-3 h-3 mr-1" /> Rosario, SF
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">
                        <RefreshCw className="w-3 h-3 animate-spin-slow" />
                        {lastUpdated ? `ACTUALIZADO ${lastUpdated}` : 'Cargando métricas...'}
                    </div>
                </div>
                <h1 className={`text-6xl md:text-8xl mb-4 text-white drop-shadow-2xl ${classes.heroName || ''}`} style={{ color: 'var(--color-primary)' }}>
                    {profile.name}
                </h1>
                <p className="text-sm md:text-lg text-white/80 tracking-[0.4em] md:tracking-[0.8em] font-semibold mb-12 uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    {profile.tagline || 'TRAP / R&B / DEEPHOUSE'}
                </p>
                {displayMetrics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 w-full max-w-5xl">
                        {displayMetrics.map((stat: any) => (
                            <div key={stat.platform + stat.metric || stat.label} className="flex flex-col items-center">
                                <span className="text-2xl md:text-4xl font-black drop-shadow-lg" style={{ color: 'var(--color-primary)' }}>
                                    {stat.value}
                                </span>
                                {stat.isLive && (
                                    <span className="mt-1 mb-0.5 inline-block px-2 py-0.5 text-[0.5rem] font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 animate-pulse rounded-full bg-green-400"></span>
                                        LIVE
                                    </span>
                                )}
                                <span className="text-[0.6rem] md:text-xs font-bold text-white/60 uppercase tracking-widest">
                                    {stat.label}
                                </span>
                                
                                {/* Trend Chart */}
                                {history && history[stat.platform === 'spotify' ? 'spotify_monthly_listeners' : 
                                                   stat.platform === 'youtube' ? (stat.label.includes('Subs') ? 'youtube_subs' : 'youtube_views') :
                                                   stat.platform === 'tiktok' ? 'tiktok_followers' : 
                                                   stat.platform === 'instagram' ? 'instagram_followers' : '']?.length > 1 && (
                                    <div className="w-full mt-4 h-8">
                                        <TrendChart 
                                            data={history[stat.platform === 'spotify' ? 'spotify_monthly_listeners' : 
                                                          stat.platform === 'youtube' ? (stat.label.includes('Subs') ? 'youtube_subs' : 'youtube_views') :
                                                          stat.platform === 'tiktok' ? 'tiktok_followers' : 
                                                          stat.platform === 'instagram' ? 'instagram_followers' : '']} 
                                            height={30}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export function DynamicBio({ profile, profileImageSource }: { profile: Profile, profileImageSource?: 'youtube_banner' | 'youtube_profile' | 'spotify_profile' | 'upload' }) {
    const { classes } = useTheme()
    
    const getProfileImage = () => {
        if (profileImageSource === 'upload') {
            return profile.uploadedProfileImage || ''
        }
        if (profileImageSource === 'spotify_profile') {
            return profile.spotifyProfileImage || ''
        }
        if (profileImageSource === 'youtube_banner') {
            return profile.youtubeHeroImage || ''
        }
        if (profileImageSource === 'youtube_profile') {
            return profile.youtubeProfileImage || ''
        }
        return ''
    }
    
    return (
        <section className="py-24 md:py-32 px-4 bg-[#0a0a0a] text-white">
            <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }}
                    className={`w-full aspect-[4/5] object-cover bg-neutral-900 border border-white/5 ${classes.iframeWrap || 'rounded-3xl'}`}
                >
                    {getProfileImage() && <img src={getProfileImage()} alt={profile.name} className="w-full h-full object-cover opacity-80" />}
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }}>
                   <h4 className="text-[0.65rem] md:text-xs font-bold tracking-widest uppercase flex items-center mb-6" style={{ color: 'var(--color-primary)' }}>
                       <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       Biografía
                   </h4>
                   <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9]" style={{ fontFamily: 'var(--font-heading)' }}>
                       SOBRE EL <br/><span style={{ color: 'var(--color-primary)' }}>ARTISTA</span>
                   </h2>
                    <p className="text-white/60 text-lg leading-relaxed mb-10 text-pretty" style={{ fontFamily: 'var(--font-body)' }}>
                        {profile.bio || 'Artista emergente de Rosario, Argentina.'}
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

interface Platforms {
    spotify?: { iframe?: string; enabled?: boolean }
    youtube?: { iframe?: string; enabled?: boolean }
    instagram?: { enabled?: boolean }
    tiktok?: { enabled?: boolean }
    soundcloud?: { iframe?: string; enabled?: boolean }
    twitter?: { enabled?: boolean }
}

interface Social {
    instagram?: string
    tiktok?: string
    youtube?: string
    spotify?: string
    soundcloud?: string
    twitter?: string
}

export function DynamicMediaHub({ media, social }: { media: Platforms, social: Social }) {
    const { classes } = useTheme()
    
    const spotifyEnabled = media.spotify?.enabled && media.spotify?.iframe
    const youtubeEnabled = media.youtube?.enabled && media.youtube?.iframe
    const soundcloudEnabled = media.soundcloud?.enabled && media.soundcloud?.iframe
    
    const enabledEmbeds = [spotifyEnabled, youtubeEnabled, soundcloudEnabled].filter(Boolean).length
    
    return (
        <section className="py-24 md:py-32 px-4 bg-[#050505]">
            <div className="container mx-auto max-w-6xl">
                <h4 className="text-[0.65rem] md:text-xs font-bold tracking-widest uppercase flex items-center mb-10" style={{ color: 'var(--color-primary)' }}>
                    <Play className="w-4 h-4 mr-2" /> ESCUCHÁ Y MIRÁ
                </h4>
                <div className={`grid gap-8 ${enabledEmbeds === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {spotifyEnabled ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
                            className={`p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl ${classes.card || 'rounded-[2rem]'}`}
                        >
                            <h5 className="text-[0.65rem] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center mb-8">
                                <Music2 className="w-4 h-4 mr-3" /> SPOTIFY
                            </h5>
                            <div className={`${classes.iframeWrap || 'rounded-[1.5rem]'} w-full bg-black/50 overflow-hidden ring-1 ring-white/10`} style={{ minHeight: '352px' }} dangerouslySetInnerHTML={{ __html: media.spotify?.iframe || '' }} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
                            className={`p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl opacity-50 ${classes.card || 'rounded-[2rem]'}`}
                        >
                            <h5 className="text-[0.65rem] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center mb-8">
                                <Music2 className="w-4 h-4 mr-3" /> SPOTIFY
                            </h5>
                            <div className={`${classes.iframeWrap || 'rounded-[1.5rem]'} w-full bg-black/50 overflow-hidden ring-1 ring-white/10 flex items-center justify-center`} style={{ minHeight: '352px' }}>
                                <div className="text-white/30 text-center">
                                    <Music2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">Spotify no disponible</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {youtubeEnabled ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }}
                            className={`p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl flex flex-col ${classes.card || 'rounded-[2rem]'}`}
                        >
                            <h5 className="text-[0.65rem] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center mb-8">
                                <Youtube className="w-4 h-4 mr-3" /> YOUTUBE
                            </h5>
                            <div className={`${classes.iframeWrap || 'rounded-[1.5rem]'} w-full overflow-hidden aspect-video bg-black/50 relative ring-1 ring-white/10 flex-1`} dangerouslySetInnerHTML={{ __html: media.youtube?.iframe || '' }} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }}
                            className={`p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl flex flex-col opacity-50 ${classes.card || 'rounded-[2rem]'}`}
                        >
                            <h5 className="text-[0.65rem] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center mb-8">
                                <Youtube className="w-4 h-4 mr-3" /> YOUTUBE
                            </h5>
                            <div className={`${classes.iframeWrap || 'rounded-[1.5rem]'} w-full overflow-hidden aspect-video bg-black/50 relative ring-1 ring-white/10 flex items-center justify-center flex-1`}>
                                <div className="text-white/30 text-center">
                                    <Youtube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">YouTube no disponible</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {soundcloudEnabled ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.4 }}
                            className={`p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl flex flex-col ${classes.card || 'rounded-[2rem]'}`}
                        >
                            <h5 className="text-[0.65rem] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center mb-8">
                                <Cloud className="w-4 h-4 mr-3" /> SOUNDCLOUD
                            </h5>
                            <div className={`${classes.iframeWrap || 'rounded-[1.5rem]'} w-full overflow-hidden bg-black/50 relative ring-1 ring-white/10`} dangerouslySetInnerHTML={{ __html: media.soundcloud?.iframe || '' }} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.4 }}
                            className={`p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl flex flex-col opacity-50 ${classes.card || 'rounded-[2rem]'}`}
                        >
                            <h5 className="text-[0.65rem] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center mb-8">
                                <Cloud className="w-4 h-4 mr-3" /> SOUNDCLOUD
                            </h5>
                            <div className={`${classes.iframeWrap || 'rounded-[1.5rem]'} w-full overflow-hidden bg-black/50 relative ring-1 ring-white/10 flex items-center justify-center`} style={{ minHeight: '166px' }}>
                                <div className="text-white/30 text-center">
                                    <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">SoundCloud no disponible</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    )
}

export function DynamicSocialStack({ social, platforms }: { social: Social, platforms: Platforms }) {
    const { classes } = useTheme()
    
    const socialLinks = [
        { 
            key: 'instagram', 
            url: social.instagram, 
            enabled: platforms.instagram?.enabled && social.instagram,
            label: 'Instagram', 
            icon: <Instagram size={24} />,
            gradient: 'from-yellow-500 via-pink-500 to-purple-500',
            shadow: 'shadow-pink-500/20'
        },
        { 
            key: 'tiktok', 
            url: social.tiktok, 
            enabled: platforms.tiktok?.enabled && social.tiktok,
            label: 'TikTok', 
            icon: <Music2 size={24} className="text-cyan-400 drop-shadow-[2px_2px_0_rgba(255,0,80,1)]" />,
            gradient: 'from-gray-900 to-gray-700',
            shadow: 'shadow-cyan-500/10',
            border: true
        },
        { 
            key: 'youtube', 
            url: social.youtube, 
            enabled: platforms.youtube?.enabled && social.youtube,
            label: 'YouTube', 
            icon: <Youtube size={24} />,
            gradient: 'bg-[#FF0000]',
            shadow: 'shadow-red-500/20'
        },
        { 
            key: 'spotify', 
            url: social.spotify, 
            enabled: platforms.spotify?.enabled && social.spotify,
            label: 'Spotify', 
            icon: <Music2 size={24} />,
            gradient: 'bg-[#1DB954]',
            shadow: 'shadow-green-500/20'
        },
        { 
            key: 'soundcloud', 
            url: social.soundcloud, 
            enabled: platforms.soundcloud?.enabled && social.soundcloud,
            label: 'SoundCloud', 
            icon: <Cloud size={24} className="text-orange-400" />,
            gradient: 'bg-orange-500',
            shadow: 'shadow-orange-500/20'
        },
        { 
            key: 'twitter', 
            url: social.twitter, 
            enabled: platforms.twitter?.enabled && social.twitter,
            label: 'X / Twitter', 
            icon: <Twitter size={24} />,
            gradient: 'bg-black',
            shadow: 'shadow-white/10',
            border: true
        }
    ]
    
    const enabledLinks = socialLinks.filter(link => link.enabled)
    const disabledLinks = socialLinks.filter(link => !link.enabled)
    
    return (
        <section className="py-24 md:py-32 px-4 bg-[#0a0a0a]">
            <div className="container mx-auto max-w-3xl">
                <h4 className="text-[0.65rem] md:text-xs font-bold tracking-widest flex items-center mb-10 uppercase" style={{ color: 'var(--color-primary)' }}>
                    <TrendingUp className="w-4 h-4 mr-2" /> SEGUIME EN
                </h4>
                <div className="flex flex-col gap-4">
                    {enabledLinks.map(link => (
                        <motion.a 
                            key={link.key}
                            href={link.url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.01 }} 
                            className={`flex items-center p-5 bg-[#0d0d0d] hover:bg-[#111111] transition border border-white/5 ${classes.socialBtn || 'rounded-2xl'}`}
                        >
                            <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-white mr-6 shadow-lg ${link.gradient} ${link.shadow} ${link.border ? 'border border-white/10' : ''}`}>
                                {link.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-0.5">{link.label}</h3>
                                <p className="text-white/40 text-sm">Seguí en {link.label}</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-white/20" />
                        </motion.a>
                    ))}
                    
                    {disabledLinks.map(link => (
                        <div 
                            key={link.key}
                            className={`flex items-center p-5 bg-[#0d0d0d] border border-white/5 opacity-40 cursor-not-allowed ${classes.socialBtn || 'rounded-2xl'}`}
                        >
                            <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-white mr-6 shadow-lg grayscale ${link.gradient} ${link.shadow} ${link.border ? 'border border-white/10' : ''}`}>
                                {link.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-0.5">{link.label}</h3>
                                <p className="text-white/40 text-sm">No disponible</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-white/10" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

interface Booking {
    whatsapp?: string
    whatsappMessage?: string
    email?: string
}

export function DynamicBooking({ booking }: { booking: Booking }) {
    const { classes } = useTheme()
    
    const whatsappNumber = booking.whatsapp?.replace(/\D/g, '') || ''
    const whatsappMessage = booking.whatsappMessage || '¡Hola! Quiero coordinar una fecha.'
    
    return (
        <section className="py-32 px-4 bg-[#050505] text-center border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-primary)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="container mx-auto max-w-2xl flex flex-col items-center relative z-10">
                <div className={`px-4 py-1.5 border border-white/10 mb-8 inline-flex items-center text-[0.65rem] md:text-xs font-bold tracking-widest uppercase text-white/70 ${classes.badge || 'rounded-full'}`}>
                    <Zap className="w-3 h-3 mr-2" style={{ color: 'var(--color-primary)' }}/> AGENDÁ AHORA
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase leading-[0.9]" style={{ fontFamily: 'var(--font-heading)' }}>
                    <span className="text-white">CONTRATACIONES</span> <br/><span style={{ color: 'var(--color-primary)' }}>/ FECHAS</span>
                </h2>
                <p className="text-white/50 mb-12 text-lg max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                    ¿Querés agendar un show, festival o evento privado? Contactanos directamente por WhatsApp y coordinamos los detalles.
                </p>
                {whatsappNumber ? (
                    <motion.a 
                        whileHover={{ scale: 1.05 }}
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} 
                        className={`inline-flex items-center justify-center px-8 py-5 text-black text-lg font-bold mb-8 hover:opacity-90 w-full md:w-auto shadow-xl ${classes.btn || 'rounded-full'}`}
                        style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 40px rgba(var(--color-primary), 0.2)' }}
                    >
                        <MessageCircle className="w-6 h-6 mr-3"/> Consultar por WhatsApp
                    </motion.a>
                ) : (
                    <div className={`inline-flex items-center justify-center px-8 py-5 text-white/30 text-lg font-bold mb-8 w-full md:w-auto ${classes.btn || 'rounded-full'}`} style={{ backgroundColor: 'var(--color-primary)', opacity: 0.3 }}>
                        <MessageCircle className="w-6 h-6 mr-3"/> WhatsApp no disponible
                    </div>
                )}
                {booking.email && (
                    <p className="text-sm text-white/30 flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4"/> O escribiendo a <br className="md:hidden"/><a href={`mailto:${booking.email}`} className="font-medium hover:text-white transition underline underline-offset-4 decoration-white/20" style={{ color: 'var(--color-primary)' }}>{booking.email}</a>
                    </p>
                )}
            </div>
        </section>
    )
}

export function Footer() {
    const currentYear = new Date().getFullYear()
    
    return (
        <footer className="py-12 bg-black border-t border-white/5 text-center text-white/20">
            <p className="text-xs font-mono tracking-widest uppercase">© {currentYear} ArtistHub</p>
        </footer>
    )
}

