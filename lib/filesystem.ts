/**
 * Filesystem utilities for local data storage
 * Each restaurant has its own folder: data/restaurants/{restaurant-slug}/
 *
 * IMAGES: Now stored in Supabase Storage for production compatibility
 */

import fs from 'fs'
import path from 'path'
import {
  uploadImage,
  deleteImage,
  generateImagePath,
  getExtensionFromDataUrl,
  getContentTypeFromDataUrl
} from './supabase/storage'

const DATA_DIR = path.join(process.cwd(), 'data', 'restaurants')

// Use Supabase Storage for images (compatible with Vercel)
const USE_SUPABASE_STORAGE = process.env.NEXT_PUBLIC_SUPABASE_URL ? true : false

/**
 * Ensure restaurant directory exists
 */
export function ensureRestaurantDir(slug: string): string {
  const restaurantDir = path.join(DATA_DIR, slug)

  if (!fs.existsSync(restaurantDir)) {
    fs.mkdirSync(restaurantDir, { recursive: true })
  }

  const imagesDir = path.join(restaurantDir, 'images')
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }

  return restaurantDir
}

/**
 * Read JSON file from restaurant folder
 */
export function readRestaurantFile<T>(slug: string, filename: string): T | null {
  try {
    const restaurantDir = ensureRestaurantDir(slug)
    const filePath = path.join(restaurantDir, filename)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    console.error(`Error reading ${filename} for ${slug}:`, err)
    return null
  }
}

/**
 * Write JSON file to restaurant folder
 */
export function writeRestaurantFile<T>(slug: string, filename: string, data: T): boolean {
  try {
    const restaurantDir = ensureRestaurantDir(slug)
    const filePath = path.join(restaurantDir, filename)

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error(`Error writing ${filename} for ${slug}:`, err)
    return false
  }
}

/**
 * Save base64 image to restaurant images folder or Supabase Storage
 */
export async function saveRestaurantImage(slug: string, imageId: string, base64Data: string): Promise<string | null> {
  try {
    // Extract base64 data and extension
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      // If not base64, assume it's already a URL
      return base64Data
    }

    // Use Supabase Storage if available
    if (USE_SUPABASE_STORAGE) {
      const extension = getExtensionFromDataUrl(base64Data)
      const contentType = getContentTypeFromDataUrl(base64Data)
      const filePath = generateImagePath(slug, 'items', imageId, extension)

      const publicUrl = await uploadImage(filePath, base64Data, contentType)
      return publicUrl
    }

    // Fallback to local filesystem
    const restaurantDir = ensureRestaurantDir(slug)
    const imagesDir = path.join(restaurantDir, 'images')

    const extension = matches[1]
    const data = matches[2]
    const filename = `${imageId}.${extension}`
    const filePath = path.join(imagesDir, filename)

    // Delete any existing images with the same ID but different extension
    const existingFiles = fs.readdirSync(imagesDir)
    existingFiles.forEach(file => {
      if (file.startsWith(`${imageId}.`) && file !== filename) {
        try {
          fs.unlinkSync(path.join(imagesDir, file))
        } catch (err) {
          console.error(`Error deleting old image ${file}:`, err)
        }
      }
    })

    // Save as binary file
    const buffer = Buffer.from(data, 'base64')
    fs.writeFileSync(filePath, buffer)

    // Return API URL to serve the image
    return `/api/restaurants/${slug}/images/${filename}`
  } catch (err) {
    console.error(`Error saving image for ${slug}:`, err)
    return null
  }
}

/**
 * Delete image from restaurant images folder or Supabase Storage
 */
export async function deleteRestaurantImage(slug: string, imageUrl: string): Promise<boolean> {
  try {
    // Use Supabase Storage if available
    if (USE_SUPABASE_STORAGE) {
      // Delete from Supabase Storage
      return await deleteImage(imageUrl)
    }

    // Fallback to local filesystem
    // Extract filename from URL - supports both old and new formats
    const matches = imageUrl.match(/\/(?:data|api\/restaurants)\/[^/]+\/images\/(.+)$/)
    if (!matches) {
      return false
    }

    const restaurantDir = ensureRestaurantDir(slug)
    const filePath = path.join(restaurantDir, 'images', matches[1])

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }

    return false
  } catch (err) {
    console.error(`Error deleting image for ${slug}:`, err)
    return false
  }
}

/**
 * Get all restaurant slugs
 */
export function getAllRestaurantSlugs(): string[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      return []
    }

    return fs.readdirSync(DATA_DIR).filter(item => {
      const itemPath = path.join(DATA_DIR, item)
      return fs.statSync(itemPath).isDirectory()
    })
  } catch (err) {
    console.error('Error reading restaurant directories:', err)
    return []
  }
}
