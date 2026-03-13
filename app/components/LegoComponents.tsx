'use client'

import { motion } from 'framer-motion'
import { Instagram, Youtube, Music2, MessageCircle, Mail, TrendingUp, Zap, MapPin, Play, ExternalLink } from 'lucide-react'
import { useTheme } from '../themeEngine'

export function DynamicHero({ profile, metrics }: { profile: any, metrics: any[] }) {
    const { classes } = useTheme()
    return (
        <section 
            className="relative min-h-screen flex flex-col justify-end pb-24 overflow-hidden"
            style={{ 
                backgroundImage: `url(${profile.heroImageUrl})`,
                backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
            }}
        >
            <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="container mx-auto relative z-10 flex flex-col items-center text-center px-4">
                <div className={`mb-6 px-4 py-1.5 border border-white/20 text-xs font-bold tracking-widest uppercase text-white/80 backdrop-blur-md ${classes.badge || 'rounded-full'}`}>
                    <MapPin className="inline w-3 h-3 mr-1" /> {profile.badge || 'Rosario, SF'}
                </div>
                <h1 className={`text-6xl md:text-8xl mb-4 text-white drop-shadow-2xl ${classes.heroName || ''}`} style={{ color: 'var(--color-primary)' }}>
                    {profile.name}
                </h1>
                <p className="text-sm md:text-lg text-white/80 tracking-[0.4em] md:tracking-[0.8em] font-semibold mb-16 uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    {profile.tagline || 'TRAP / R&B / DEEPHOUSE'}
                </p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-24">
                    {metrics.slice(0, 3).map(stat => (
                        <div key={stat.label} className="text-left flex flex-col items-start">
                            {stat.isLive && (
                                <span className="mb-1.5 inline-block px-1.5 py-[1px] text-[0.6rem] font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded w-max flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 animate-pulse rounded-full bg-green-400"></span>
                                    LIVE
                                </span>
                            )}
                            <span className="text-3xl md:text-5xl font-black mb-1 drop-shadow-lg" style={{ color: 'var(--color-primary)' }}>{stat.value}</span>
                            <span className="text-[0.65rem] md:text-xs font-bold text-white/60 uppercase tracking-widest leading-none">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function DynamicBio({ profile }: { profile: any }) {
    const { classes } = useTheme()
    return (
        <section className="py-24 md:py-32 px-4 bg-[#0a0a0a] text-white">
            <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }}
                    className={`w-full aspect-[4/5] object-cover bg-neutral-900 border border-white/5 ${classes.iframeWrap || 'rounded-3xl'}`}
                >
                    <img src={profile.heroImageUrl} alt={profile.name} className="w-full h-full object-cover opacity-80" />
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
                       {profile.bio}
                   </p>
                   <div className="flex flex-wrap gap-4">
                       <span className={`px-5 py-2.5 text-[0.65rem] md:text-xs font-bold uppercase tracking-wider bg-white/[0.03] text-white/50 border border-white/10 ${classes.badge || 'rounded-full'}`}>INDEPENDENT</span>
                       <span className={`px-5 py-2.5 text-[0.65rem] md:text-xs font-bold uppercase tracking-wider bg-white/[0.03] text-white/50 border border-white/10 ${classes.badge || 'rounded-full'}`}>PRODUCER</span>
                       <span className={`px-5 py-2.5 text-[0.65rem] md:text-xs font-bold uppercase tracking-wider bg-white/[0.03] text-white/50 border border-white/10 ${classes.badge || 'rounded-full'}`}>ARTIST</span>
                   </div>
                </motion.div>
            </div>
        </section>
    )
}

export function DynamicMediaHub({ media }: { media: any }) {
    const { classes } = useTheme()
    return (
        <section className="py-24 md:py-32 px-4 bg-[#050505]">
            <div className="container mx-auto max-w-6xl">
                <h4 className="text-[0.65rem] md:text-xs font-bold tracking-widest uppercase flex items-center mb-10" style={{ color: 'var(--color-primary)' }}>
                    <Play className="w-4 h-4 mr-2" /> ESCUCHÁ Y MIRÁ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {media.spotifyArtistId && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
                            className={`p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl ${classes.card || 'rounded-[2rem]'}`}
                        >
                            <h5 className="text-[0.65rem] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center mb-8">
                                <Music2 className="w-4 h-4 mr-3" /> PERFIL DEL ARTISTA
                            </h5>
                            <div className={`${classes.iframeWrap || 'rounded-[1.5rem]'} w-full bg-black/50 overflow-hidden ring-1 ring-white/10`} style={{ minHeight: '352px' }}>
                                <iframe style={{borderRadius: '0'}} src={`https://open.spotify.com/embed/artist/${media.spotifyArtistId}?utm_source=generator&theme=0`} width="100%" height="352" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                            </div>
                        </motion.div>
                    )}
                    {media.youtubeVideoId && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }}
                            className={`p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl flex flex-col ${classes.card || 'rounded-[2rem]'}`}
                        >
                            <h5 className="text-[0.65rem] md:text-xs text-white/40 font-bold uppercase tracking-widest flex items-center mb-8">
                                <Youtube className="w-4 h-4 mr-3" /> VIDEO PRINCIPAL
                            </h5>
                            <div className={`${classes.iframeWrap || 'rounded-[1.5rem]'} w-full overflow-hidden aspect-video bg-black/50 relative ring-1 ring-white/10 flex-1`}>
                                <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${media.youtubeVideoId}?rel=0`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    )
}

export function DynamicSocialStack({ social }: { social: any }) {
    const { classes } = useTheme()
    return (
        <section className="py-24 md:py-32 px-4 bg-[#0a0a0a]">
            <div className="container mx-auto max-w-3xl">
                <h4 className="text-[0.65rem] md:text-xs font-bold tracking-widest flex items-center mb-10 uppercase" style={{ color: 'var(--color-primary)' }}>
                    <TrendingUp className="w-4 h-4 mr-2" /> SEGUIME EN
                </h4>
                <div className="flex flex-col gap-4">
                    {social.instagram && (
                        <motion.a href={social.instagram} whileHover={{ scale: 1.01 }} className={`flex items-center p-5 bg-[#0d0d0d] hover:bg-[#111111] transition border border-white/5 ${classes.socialBtn || 'rounded-2xl'}`}>
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 text-white mr-6 shadow-lg shadow-pink-500/20">
                                <Instagram size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-0.5">Instagram</h3>
                                <p className="text-white/40 text-sm">Seguí en Instagram</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-white/20" />
                        </motion.a>
                    )}
                    {social.tiktok && (
                        <motion.a href={social.tiktok} whileHover={{ scale: 1.01 }} className={`flex items-center p-5 bg-[#0d0d0d] hover:bg-[#111111] transition border border-white/5 ${classes.socialBtn || 'rounded-2xl'}`}>
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#000000] text-white border border-white/10 mr-6 shadow-lg shadow-cyan-500/10">
                                <Music2 size={24} className="text-cyan-400 drop-shadow-[2px_2px_0_rgba(255,0,80,1)]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-0.5">TikTok</h3>
                                <p className="text-white/40 text-sm">Seguí el contenido</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-white/20" />
                        </motion.a>
                    )}
                    {social.youtube && (
                        <motion.a href={social.youtube} whileHover={{ scale: 1.01 }} className={`flex items-center p-5 bg-[#0d0d0d] hover:bg-[#111111] transition border border-white/5 ${classes.socialBtn || 'rounded-2xl'}`}>
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#FF0000] text-white mr-6 shadow-lg shadow-red-500/20">
                                <Youtube size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-0.5">YouTube</h3>
                                <p className="text-white/40 text-sm">Suscribite al canal</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-white/20" />
                        </motion.a>
                    )}
                    {social.spotify && (
                        <motion.a href={social.spotify} whileHover={{ scale: 1.01 }} className={`flex items-center p-5 bg-[#0d0d0d] hover:bg-[#111111] transition border border-white/5 ${classes.socialBtn || 'rounded-2xl'}`}>
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#1DB954] text-white mr-6 shadow-lg shadow-green-500/20">
                                <Music2 size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-0.5">Spotify</h3>
                                <p className="text-white/40 text-sm">Seguí en Spotify</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-white/20" />
                        </motion.a>
                    )}
                </div>
            </div>
        </section>
    )
}

export function DynamicBooking({ booking }: { booking: any }) {
    const { classes } = useTheme()
    return (
        <section className="py-32 px-4 bg-[#050505] text-center border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-primary)] opacity-[0.03] blur-[120px] rounded-full point-events-none"></div>
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
                <motion.a 
                    whileHover={{ scale: 1.05 }}
                    href={`https://wa.me/${booking.whatsappNumber}?text=${encodeURIComponent(booking.whatsappMessage)}`} 
                    className={`inline-flex items-center justify-center px-8 py-5 text-black text-lg font-bold mb-8 hover:opacity-90 w-full md:w-auto shadow-xl ${classes.btn || 'rounded-full'}`}
                    style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 40px rgba(var(--color-primary), 0.2)' }}
                >
                    <MessageCircle className="w-6 h-6 mr-3"/> Consultar por WhatsApp
                </motion.a>
                <p className="text-sm text-white/30 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4"/> O escribinos a <br className="md:hidden"/><a href={`mailto:${booking.email}`} className="font-medium hover:text-white transition underline underline-offset-4 decoration-white/20" style={{ color: 'var(--color-primary)' }}>{booking.email}</a>
                </p>
            </div>
        </section>
    )
}

export function Footer() {
    return (
        <footer className="py-12 bg-black border-t border-white/5 text-center text-white/20">
            <p className="text-xs font-mono tracking-widest uppercase">© 2024 ArtistHub Studio</p>
        </footer>
    )
}

export function MilestoneBanner({ milestones }: { milestones: any[] }) { return null }
export function TrendingAlert({ trends }: { trends: any[] }) { return null }
export function DynamicStatsSection({ metrics }: { metrics: any[] }) { return null }
