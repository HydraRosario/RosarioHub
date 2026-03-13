import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data.json')

const readData = () => {
    try {
        if (!fs.existsSync(dataFilePath)) return []
        return JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
    } catch {
        return []
    }
}

const writeData = (data: any) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
        return true
    } catch {
        return false
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const artists = readData()
    const artist = artists.find((a: any) => a.id === id)
    
    if (!artist) {
        return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }
    
    return NextResponse.json(artist)
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const updates = await request.json()
    const artists = readData()
    const index = artists.findIndex((a: any) => a.id === id)
    
    if (index === -1) {
        return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }
    
    artists[index] = { ...artists[index], ...updates }
    writeData(artists)
    
    return NextResponse.json(artists[index])
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    let artists = readData()
    const index = artists.findIndex((a: any) => a.id === id)
    
    if (index === -1) {
        return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }
    
    artists = artists.filter((a: any) => a.id !== id)
    writeData(artists)
    
    return NextResponse.json({ success: true })
}
