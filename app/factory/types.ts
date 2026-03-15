export interface PlatformConfig {
    artistId?: string
    channelId?: string
    channelHandle?: string
    videoId?: string
    username?: string
    iframe?: string
    enabled: boolean
}

export interface Artist {
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
        youtubeProfileImage?: string
        youtubeHeroImage?: string
        spotifyProfileImage?: string
        // Nuevos campos para imágenes subidas
        uploadedHeroImage?: string
        uploadedProfileImage?: string
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
    metrics: {
        spotify_monthly_listeners: number
        youtube_subs: number
        youtube_views: number
        youtube_videos: number
        instagram_followers: number
        tiktok_followers: number
        tiktok_likes: number
        soundcloud_followers: number
        twitter_followers: number
        relevance_score: number
        lastUpdated?: string
    }
    created_at: string
    // Image source preferences
    heroImageSource?: 'spotify_profile' | 'youtube_banner' | 'youtube_profile' | 'upload'
    profileImageSource?: 'spotify_profile' | 'youtube_banner' | 'youtube_profile' | 'upload'
    // Compatibility fields
    name?: string
    email?: string
}

export interface MetricData {
    label: string
    value: string
    numericValue: number
    platform: string
    isLive: boolean
    growth?: number
    priorityNum?: number
    metric: string
}

export interface ArtistSnapshot {
    artistId?: string
    timestamp: string
    metrics: {
        spotify_monthly_listeners?: number
        youtube_subs?: number
        youtube_views?: number
        youtube_videos?: number
        instagram_followers?: number
        tiktok_followers?: number
        tiktok_likes?: number
        soundcloud_followers?: number
        twitter_followers?: number
        relevance_score?: number
        [key: string]: number | undefined
    }
}

export interface Snapshot {
    id?: string
    artistId?: string
    timestamp: string
    metrics: {
        spotify_monthly_listeners?: number
        youtube_subs?: number
        youtube_views?: number
        youtube_videos?: number
        instagram_followers?: number
        tiktok_followers?: number
        tiktok_likes?: number
        soundcloud_followers?: number
        twitter_followers?: number
        relevance_score?: number
    }
}
