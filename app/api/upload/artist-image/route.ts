import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Función simple para generar nombres únicos
const generateUniqueId = () => {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const artistId = formData.get('artistId') as string
        const imageType = formData.get('imageType') as 'hero' | 'profile'

        if (!file || !artistId || !imageType) {
            return NextResponse.json(
                { error: 'Missing required fields: file, artistId, imageType' },
                { status: 400 }
            )
        }

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            )
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            )
        }

        // Crear directorio del artista si no existe
        const artistDir = join(process.cwd(), 'public', 'uploads', 'artists', artistId)
        const typeDir = join(artistDir, imageType)
        
        try {
            await mkdir(typeDir, { recursive: true })
        } catch (error) {
            // Directorio ya existe, está bien
        }

        // Generar nombre único
        const fileExtension = file.name.split('.').pop()
        const uniqueFileName = `${generateUniqueId()}.${fileExtension}`
        const filePath = join(typeDir, uniqueFileName)

        // Guardar archivo
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Generar URL pública
        const publicUrl = `/uploads/artists/${artistId}/${imageType}/${uniqueFileName}`

        return NextResponse.json({
            success: true,
            imageUrl: publicUrl,
            fileName: uniqueFileName
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        )
    }
}
