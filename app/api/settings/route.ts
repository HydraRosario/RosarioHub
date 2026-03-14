import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_PATH = path.join(process.cwd(), 'settings.json')

export async function GET() {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) {
            const defaultSettings = {
                leaderboard: {
                    platforms: true,
                    top10: true,
                    growth: true,
                    legacy: true,
                    reach: true
                }
            }
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2))
            return NextResponse.json(defaultSettings)
        }
        const data = fs.readFileSync(SETTINGS_PATH, 'utf-8')
        return NextResponse.json(JSON.parse(data))
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const settings = await request.json()
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
        return NextResponse.json(settings)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
