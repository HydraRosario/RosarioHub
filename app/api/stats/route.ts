import { NextResponse } from 'next/server'

// Parse subscriber/count (handles K, M, B suffixes)
function parseCount(value: string): number {
    if (!value) return 0
    // Handle European format (1.71K = 1710, not 171000)
    // First replace comma with dot if it's a decimal separator
    let cleaned = value.trim().toUpperCase().replace(',', '.')
    // Remove any remaining dots that are thousand separators
    const parts = cleaned.split('.')
    if (parts.length > 2) {
        // Multiple dots: 1.000.000 -> remove middle dots
        cleaned = parts[0] + '.' + parts.slice(1).join('')
    }
    // Now handle K, M, B
    const numStr = cleaned.replace(/[KMB]/g, '')
    const num = parseFloat(numStr)
    if (isNaN(num)) return 0
    if (cleaned.includes('M')) return Math.round(num * 1000000)
    if (cleaned.includes('K')) return Math.round(num * 1000)
    if (cleaned.includes('B')) return Math.round(num * 1000000000)
    return Math.round(num)
}

// Format number for display
function formatNumber(num: number): string {
    if (!num) return '0'
    return num.toLocaleString('es-AR')
}

// Helper function definitions for scraping logic
async function scrapeSpotifyStats(artistId: string) {
    if (!artistId) return null
    try {
        const url = `https://open.spotify.com/artist/${artistId}`
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 300 }
        })

        if (!response.ok) return null

        const html = await response.text()
        const results: any[] = []

        // 1. Monthly Listeners
        const listenersRegex = /([\d.,KMB]+)\s*(?:monthly listeners|oyentes mensuales)/i
        const lMatch = html.match(listenersRegex)
        if (lMatch) {
            const numValue = parseCount(lMatch[1])
            results.push({
                label: 'Spotify Oyentes',
                value: lMatch[1],
                numericValue: numValue,
                platform: 'spotify',
                isLive: true,
                priority: 8,
                metric: 'listeners'
            })
        }

        // 2. Followers (alternative)
        const followersRegex = /([\d.,KMB]+)\s*followers/i
        const fMatch = html.match(followersRegex)
        if (fMatch) {
            const numValue = parseCount(fMatch[1])
            results.push({
                label: 'Spotify Followers',
                value: fMatch[1],
                numericValue: numValue,
                platform: 'spotify',
                isLive: true,
                priority: 7,
                metric: 'followers'
            })
        }

        return results
    } catch (error) {
        console.error('Error fetching Spotify:', error)
        return null
    }
}

// YouTube Data API - using environment variable
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

async function getYouTubeChannelStats(channelId: string) {
    const results: any[] = []
    
    try {
        // Get channel statistics
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
        const channelResponse = await fetch(channelUrl, { next: { revalidate: 300 } })
        
        if (channelResponse.ok) {
            const channelData = await channelResponse.json()
            
            if (channelData.items && channelData.items.length > 0) {
                const stats = channelData.items[0].statistics
                
                if (stats.subscriberCount) {
                    results.push({
                        label: 'YouTube Subs',
                        value: formatNumber(parseInt(stats.subscriberCount)),
                        numericValue: parseInt(stats.subscriberCount),
                        platform: 'youtube',
                        isLive: true,
                        priority: 6,
                        metric: 'subscribers'
                    })
                }
                
                if (stats.viewCount) {
                    results.push({
                        label: 'YouTube Views',
                        value: formatNumber(parseInt(stats.viewCount)),
                        numericValue: parseInt(stats.viewCount),
                        platform: 'youtube',
                        isLive: true,
                        priority: 5,
                        metric: 'views'
                    })
                }
                
                if (stats.videoCount) {
                    results.push({
                        label: 'YouTube Videos',
                        value: stats.videoCount,
                        numericValue: parseInt(stats.videoCount),
                        platform: 'youtube',
                        isLive: true,
                        priority: 2,
                        metric: 'videos'
                    })
                }
            }
        }
    } catch (e) {
        console.error('YouTube API error:', e)
    }
    
    return results
}

async function scrapeYoutubeStats(channelId: string) {
    if (!channelId) return null
    const results: any[] = []
    
    // Method 1: RSS Feed (no auth needed, but limited)
    try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
        const rssResponse = await fetch(rssUrl, { next: { revalidate: 300 } })
        
        if (rssResponse.ok) {
            const rssText = await rssResponse.text()
            
            // Get video count from RSS
            const entryMatches = rssText.match(/<entry>/g)
            if (entryMatches) {
                results.push({
                    label: 'YouTube Videos',
                    value: entryMatches.length.toString(),
                    numericValue: entryMatches.length,
                    platform: 'youtube',
                    isLive: false,
                    priority: 2,
                    metric: 'videos'
                })
            }
        }
    } catch (e) {
        console.log('YouTube RSS failed')
    }
    
    // Method 2: Try scraping with different approaches
    try {
        // Try using a CORS proxy (public one for testing)
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/channel/${channelId}/about`)}`
        const response = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 60 }
        })

        if (response.ok) {
            const html = await response.text()
            
            const subsMatch = html.match(/"subscriberCountText":{"simpleText":"([\d.,KMB]+)"/)
            if (subsMatch) {
                results.push({
                    label: 'YouTube Subs',
                    value: subsMatch[1],
                    numericValue: parseCount(subsMatch[1]),
                    platform: 'youtube',
                    isLive: true,
                    priority: 6,
                    metric: 'subscribers'
                })
            }
            
            const viewMatch = html.match(/"viewCountText":{"simpleText":"([\d,]+)"/)
            if (viewMatch) {
                results.push({
                    label: 'YouTube Views',
                    value: viewMatch[1],
                    numericValue: parseInt(viewMatch[1].replace(/,/g, '')),
                    platform: 'youtube',
                    isLive: true,
                    priority: 5,
                    metric: 'views'
                })
            }
        }
    } catch (e) {
        console.log('YouTube proxy failed:', e)
    }
    
    // Method 3: Try noembed (free service)
    try {
        const noembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/channel/${channelId}`
        const noembedResponse = await fetch(noembedUrl, { next: { revalidate: 300 } })
        
        if (noembedResponse.ok) {
            const data = await noembedResponse.json()
            if (data.subscriber_count) {
                results.push({
                    label: 'YouTube Subs',
                    value: data.subscriber_count,
                    numericValue: parseCount(data.subscriber_count),
                    platform: 'youtube',
                    isLive: true,
                    priority: 6,
                    metric: 'subscribers'
                })
            }
            if (data.view_count) {
                results.push({
                    label: 'YouTube Views',
                    value: formatNumber(parseInt(data.view_count)),
                    numericValue: parseInt(data.view_count),
                    platform: 'youtube',
                    isLive: true,
                    priority: 5,
                    metric: 'views'
                })
            }
        }
    } catch (e) {
        console.log('Noembed failed')
    }

    return results.length > 0 ? results : null
}

async function scrapeInstagramStats(username: string) {
    if (!username) return null
    try {
        // Remove @ if present
        const handle = username.replace('@', '')
        const url = `https://www.instagram.com/${handle}/`
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 300 }
        })

        if (!response.ok) return null

        const html = await response.text()
        
        // Find followers count in JSON data
        const followersMatch = html.match(/"edge_followed_by":{"count":(\d+)/)
        
        if (followersMatch) {
            const count = parseInt(followersMatch[1])
            return [{
                label: 'Instagram',
                value: formatNumber(count),
                numericValue: count,
                platform: 'instagram',
                isLive: true,
                priority: 9,
                metric: 'followers'
            }]
        }
        
        return null
    } catch (error) {
        console.error('Error fetching Instagram:', error)
        return null
    }
}

async function scrapeTikTokStats(username: string) {
    if (!username) return null
    try {
        const handle = username.replace('@', '')
        
        // Try TikTok API endpoint (mobile API)
        const apiUrl = `https://www.tiktok.com/api/user/detail/${handle}/`
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                'Accept': 'application/json',
            },
            next: { revalidate: 300 }
        })

        const results: any[] = []

        if (response.ok) {
            try {
                const data = await response.json()
                
                if (data.userInfo?.stats) {
                    const stats = data.userInfo.stats
                    
                    if (stats.followerCount) {
                        results.push({
                            label: 'TikTok Followers',
                            value: formatNumber(stats.followerCount),
                            numericValue: stats.followerCount,
                            platform: 'tiktok',
                            isLive: true,
                            priority: 4,
                            metric: 'followers'
                        })
                    }
                    
                    if (stats.likeCount) {
                        results.push({
                            label: 'TikTok Likes',
                            value: formatNumber(stats.likeCount),
                            numericValue: stats.likeCount,
                            platform: 'tiktok',
                            isLive: true,
                            priority: 3,
                            metric: 'likes'
                        })
                    }
                }
            } catch (e) {
                console.log('TikTok API parse error, trying HTML scrape')
            }
        }

        // Fallback: scrape HTML if API fails
        if (results.length === 0) {
            const htmlUrl = `https://www.tiktok.com/@${handle}?lang=es`
            const htmlResponse = await fetch(htmlUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                next: { revalidate: 300 }
            })
            
            if (htmlResponse.ok) {
                const html = await htmlResponse.text()
                
                // Try to find stats in the HTML
                const followersMatch = html.match(/"followerCount":(\d+)/)
                if (followersMatch) {
                    results.push({
                        label: 'TikTok Followers',
                        value: formatNumber(parseInt(followersMatch[1])),
                        numericValue: parseInt(followersMatch[1]),
                        platform: 'tiktok',
                        isLive: true,
                        priority: 4,
                        metric: 'followers'
                    })
                }
                
                const likesMatch = html.match(/"likeCount":(\d+)/)
                if (likesMatch) {
                    results.push({
                        label: 'TikTok Likes',
                        value: formatNumber(parseInt(likesMatch[1])),
                        numericValue: parseInt(likesMatch[1]),
                        platform: 'tiktok',
                        isLive: true,
                        priority: 3,
                        metric: 'likes'
                    })
                }
            }
        }

        return results.length > 0 ? results : null
    } catch (error) {
        console.error('Error fetching TikTok:', error)
        return null
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    
    const spotifyId = searchParams.get('spotify')
    const youtubeId = searchParams.get('youtube')
    const instagramUser = searchParams.get('instagram')
    const tiktokUser = searchParams.get('tiktok')
    
    // Also accept comma-separated values for multiple artists
    const allParams = request.url.split('?')[1]

    if (!spotifyId && !youtubeId && !instagramUser && !tiktokUser) {
        return NextResponse.json({ error: 'Missing platform IDs' }, { status: 400 })
    }

    try {
        // Fetch all platforms in parallel
        // YouTube uses the official API, others use scraping
        const [spotifyStats, youtubeStats, instagramStats, tiktokStats] = await Promise.all([
            spotifyId ? scrapeSpotifyStats(spotifyId) : Promise.resolve(null),
            youtubeId ? getYouTubeChannelStats(youtubeId) : Promise.resolve(null),
            instagramUser ? scrapeInstagramStats(instagramUser) : Promise.resolve(null),
            tiktokUser ? scrapeTikTokStats(tiktokUser) : Promise.resolve(null),
        ])

        return NextResponse.json({
            spotify: spotifyStats || [],
            youtube: youtubeStats || [],
            instagram: instagramStats || [],
            tiktok: tiktokStats || [],
            lastUpdated: new Date().toISOString(),
            scraped: {
                spotify: !!spotifyStats,
                youtube: !!youtubeStats,
                instagram: !!instagramStats,
                tiktok: !!tiktokStats
            }
        })
    } catch (error) {
        console.error('Stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        )
    }
}
