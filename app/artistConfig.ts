export const artistConfig = {
    // SEO / Meta
    htmlTitle: "HydraRosario — EPK Oficial",
    metaDescription: "Artista y productor de la escena urbana de Rosario.",

    // Perfil del Artista
    profile: {
        name: "HydraRosario",
        badge: "Rosario, SF",
        tagline: "Trap / R&B / DeepHouse",
        bio: `HydraRosario es un artista y productor de la escena urbana de Rosario.
Su sonido oscuro y lírico lo posiciona en la intersección del trap y el DeepHouse.
Desde sus primeros singles independientes en 2013 acumuló miles de reproducciones orgánicas,
consolidándose como una de las voces con mayor proyección de la ciudad.`,
        heroImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80",
        stats: [
            { label: "YouTube Subs", value: "1.7K", isLive: true, platform: 'youtube', metric: 'subs' },
            { label: "Spotify Oyentes", value: "25", isLive: true, platform: 'spotify', metric: 'listeners' },
            { label: "Video Views", value: "155K", isLive: true, platform: 'youtube', metric: 'views' },
        ],
    },

    // Media
    media: {
        spotifyTrackId: "7ouMYWpwJ422jRcDASZB7P",
        spotifyType: "track",
        spotifyArtistId: "4uPoJ3tuc56vh0w6ijU4cT",
        youtubeVideoId: "6e_K-sbtV54", // Latest: ANESTESIADO
        youtubeChannelId: "UCdfZnZPCKjkzYAoU9NC3zCw",
        youtubeHandle: "@HydraRosario",
    },

    // Links / Social
    social: {
        instagram: "https://instagram.com/hydra_rosario",
        tiktok: "https://tiktok.com/@hhhestudios",
        youtube: "https://youtube.com/@HydraRosario",
        spotify: "https://open.spotify.com/artist/4uPoJ3tuc56vh0w6ijU4cT",
    },

    // Booking
    booking: {
        whatsappNumber: "5493417207642",
        whatsappMessage: "Hola, estuve mirando tu web y quiero hacer una consulta.",
        email: "booking@hydra-rosario.com",
    },

    // Footer
    footer: {
        studioName: "ArtistHub",
        studioUrl: "https://artisthub.vercel.app",
        city: "Rosario",
    },

    // UI Style (Solo cambia el template para ver la magia)
    style: {
        template: "SOFT_TRAP", // "SOFT_TRAP" | "BRUTALIST" | "INDIE_VIBE"
        colors: {
            primary: "#1DB954",
            bg: "#0a0a0a",
            accent: "#111111",
            text: "#ededed",
        },
        fonts: {
            heading: null,
            body: null,
        },
    },
};

export default artistConfig;
