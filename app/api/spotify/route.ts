import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artistId')

    if (!artistId) {
        return NextResponse.json({ error: 'Artist ID required' }, { status: 400 })
    }

    try {
        const response = await fetch(
            `https://open.spotify.com/oembed?url=https://open.spotify.com/artist/${artistId}&format=json`
        )

        if (!response.ok) {
            return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
        }

        const data = await response.json()
        
        const result = {
            profileImage: data.thumbnail_url || null,
            heroImage: data.thumbnail_url || null,
            name: data.title
        }

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch artist data' }, { status: 500 })
    }
}
