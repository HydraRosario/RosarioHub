// Edge Functions para scraping con IPs limpias

export interface MetricData {
  platform: string
  metric_key: string
  raw_value: number
  formatted_value: string
  relevance_weight: number
}

// Metric weights para relevance scoring
export const METRIC_WEIGHTS = {
  spotify_monthly_listeners: 1.5,
  youtube_subscribers: 1.2,
  instagram_followers: 1.0,
  tiktok_views: 0.8,
  youtube_views: 0.6,
}

// Parse numeric values from formatted strings
export function parseNumeric(value: string): number {
  const clean = value.replace(/[^\d.]/g, '')
  const num = parseFloat(clean)
  
  if (value.includes('K')) return num * 1000
  if (value.includes('M')) return num * 1000000
  if (value.includes('B')) return num * 1000000000
  
  return num
}

// Spotify scraping (Edge Function)
export async function scrapeSpotifyMetrics(artistId: string): Promise<MetricData[]> {
  try {
    const response = await fetch(`https://open.spotify.com/artist/${artistId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const html = await response.text()
    const metrics: MetricData[] = []
    
    // Monthly Listeners
    const listenersRegex = /([\d.,KMB]+)\s*(?:monthly listeners|oyentes mensuales)/i
    const listenersMatch = html.match(listenersRegex)
    if (listenersMatch) {
      const value = listenersMatch[1]
      metrics.push({
        platform: 'spotify',
        metric_key: 'monthly_listeners',
        raw_value: parseNumeric(value),
        formatted_value: value,
        relevance_weight: METRIC_WEIGHTS.spotify_monthly_listeners
      })
    }
    
    // Top Track Plays
    const playsRegex = /"playCount":\s*"(\d+)"/i
    const playsMatch = html.match(playsRegex)
    if (playsMatch) {
      const rawValue = parseInt(playsMatch[1])
      const formatted = rawValue > 1000 ? (rawValue / 1000).toFixed(1) + 'K' : rawValue.toString()
      metrics.push({
        platform: 'spotify',
        metric_key: 'top_track_plays',
        raw_value: rawValue,
        formatted_value: formatted,
        relevance_weight: 0.8
      })
    }
    
    return metrics
  } catch (error) {
    console.error('Spotify scraping error:', error)
    return []
  }
}

// YouTube scraping (Edge Function)
export async function scrapeYoutubeMetrics(channelId: string): Promise<MetricData[]> {
  try {
    const response = await fetch(`https://www.youtube.com/channel/${channelId}/about?hl=en`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const html = await response.text()
    const metrics: MetricData[] = []
    
    // Subscribers (multi-pattern para robustez)
    const subsMatch = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([\d.,KMB]+)\s*subscribers/i) ||
      html.match(/"label":"([\d.,KMB]+)\s*suscriptores/i) ||
      html.match(/"content":"([\d.,KMB]+)\s*suscriptores/i) ||
      html.match(/>([\d.,KMB]+)\s*subscribers/i)
    
    if (subsMatch) {
      const value = subsMatch[1]
      metrics.push({
        platform: 'youtube',
        metric_key: 'subscribers',
        raw_value: parseNumeric(value),
        formatted_value: value,
        relevance_weight: METRIC_WEIGHTS.youtube_subscribers
      })
    }
    
    // Total Views
    const viewsMatch = html.match(/([\d.,]+)\s*views/i) || html.match(/([\d.,]+)\s*vistas/i)
    if (viewsMatch) {
      const value = viewsMatch[1]
      metrics.push({
        platform: 'youtube',
        metric_key: 'total_views',
        raw_value: parseNumeric(value),
        formatted_value: value,
        relevance_weight: METRIC_WEIGHTS.youtube_views
      })
    }
    
    return metrics
  } catch (error) {
    console.error('YouTube scraping error:', error)
    return []
  }
}

// Main scraping function
export async function scrapeAllMetrics(artist: {
  spotify_url?: string
  youtube_channel_id?: string
}): Promise<MetricData[]> {
  const allMetrics: MetricData[] = []
  
  // Spotify
  if (artist.spotify_url) {
    const spotifyId = artist.spotify_url.split('/artist/')[1]?.split('?')[0]
    if (spotifyId) {
      const spotifyMetrics = await scrapeSpotifyMetrics(spotifyId)
      allMetrics.push(...spotifyMetrics)
    }
  }
  
  // YouTube
  if (artist.youtube_channel_id) {
    const youtubeMetrics = await scrapeYoutubeMetrics(artist.youtube_channel_id)
    allMetrics.push(...youtubeMetrics)
  }
  
  return allMetrics
}
