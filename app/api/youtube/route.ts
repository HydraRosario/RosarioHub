import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
        return NextResponse.json({ error: 'Channel ID required' }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings&id=${channelId}&key=${apiKey}`
        )
        const data = await response.json()

        if (!data.items || data.items.length === 0) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
        }

        const channel = data.items[0]
        
        const result = {
            profileImage: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
            bannerImage: channel.brandingSettings?.image?.bannerMobileHdImageUrl || channel.brandingSettings?.image?.bannerHdImageUrl || channel.brandingSettings?.image?.bannerImageUrl || channel.brandingSettings?.image?.bannerExternalUrl,
            title: channel.snippet.title,
            description: channel.snippet.description
        }

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch channel data' }, { status: 500 })
    }
}