import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * API Route to serve images from data/restaurants/[slug]/images/
 * GET /api/restaurants/[slug]/images/[filename]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; filename: string }> | { slug: string; filename: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const { slug, filename } = params
    const imagePath = path.join(process.cwd(), 'data', 'restaurants', slug, 'images', filename)

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Read the file
    const imageBuffer = fs.readFileSync(imagePath)

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase()
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    }
    const contentType = contentTypeMap[ext] || 'application/octet-stream'

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json(
      { error: 'Error serving image' },
      { status: 500 }
    )
  }
}
