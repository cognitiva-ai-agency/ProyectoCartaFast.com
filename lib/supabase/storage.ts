/**
 * Supabase Storage utilities for managing restaurant images
 * Handles upload, download, and deletion of images
 */

import { createAdminClient } from './admin'

const BUCKET_NAME = 'restaurant-images'

/**
 * Upload image to Supabase Storage
 * @param filePath - Path within the bucket (e.g., 'restoran1/items/item-123.jpg')
 * @param fileData - File data as Buffer, Blob, or base64 string
 * @param contentType - MIME type (e.g., 'image/jpeg')
 * @returns Public URL of the uploaded image or null if failed
 */
export async function uploadImage(
  filePath: string,
  fileData: Buffer | Blob | string,
  contentType: string = 'image/jpeg'
): Promise<string | null> {
  try {
    const supabase = createAdminClient()

    // Convert base64 to Buffer if needed
    let uploadData: Buffer | Blob
    if (typeof fileData === 'string') {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,...")
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '')
      uploadData = Buffer.from(base64Data, 'base64')
    } else {
      uploadData = fileData
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, uploadData, {
        contentType,
        upsert: true, // Overwrite if exists
        cacheControl: '3600' // Cache for 1 hour
      })

    if (error) {
      console.error('Error uploading image to Supabase Storage:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (err) {
    console.error('Error in uploadImage:', err)
    return null
  }
}

/**
 * Delete image from Supabase Storage
 * @param filePath - Path within the bucket (e.g., 'restoran1/items/item-123.jpg')
 * @returns true if deleted successfully, false otherwise
 */
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    // Extract path from URL if full URL was provided
    let path = filePath
    if (filePath.includes(BUCKET_NAME)) {
      // Extract path after bucket name
      const parts = filePath.split(BUCKET_NAME + '/')
      path = parts[1] || filePath
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('Error deleting image from Supabase Storage:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error in deleteImage:', err)
    return false
  }
}

/**
 * Get public URL for an image
 * @param filePath - Path within the bucket
 * @returns Public URL
 */
export function getImageUrl(filePath: string): string {
  const supabase = createAdminClient()

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * List all images in a folder
 * @param folderPath - Folder path (e.g., 'restoran1/items')
 * @returns Array of file paths
 */
export async function listImages(folderPath: string): Promise<string[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath)

    if (error) {
      console.error('Error listing images:', error)
      return []
    }

    return (data || []).map(file => `${folderPath}/${file.name}`)
  } catch (err) {
    console.error('Error in listImages:', err)
    return []
  }
}

/**
 * Generate a unique file path for an image
 * @param restaurantSlug - Restaurant slug
 * @param type - Image type ('items', 'logos', 'categories')
 * @param itemId - Item/entity ID
 * @param extension - File extension (e.g., 'jpg', 'png')
 * @returns File path (e.g., 'restoran1/items/item-123.jpg')
 */
export function generateImagePath(
  restaurantSlug: string,
  type: 'items' | 'logos' | 'categories',
  itemId: string,
  extension: string = 'jpg'
): string {
  return `${restaurantSlug}/${type}/${itemId}.${extension}`
}

/**
 * Extract file extension from base64 data URL
 * @param dataUrl - Base64 data URL
 * @returns File extension (e.g., 'jpg', 'png')
 */
export function getExtensionFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+);base64,/)
  if (match) {
    const mimeType = match[1]
    // Map MIME types to extensions
    const extensionMap: { [key: string]: string } = {
      'jpeg': 'jpg',
      'jpg': 'jpg',
      'png': 'png',
      'webp': 'webp',
      'gif': 'gif'
    }
    return extensionMap[mimeType] || 'jpg'
  }
  return 'jpg'
}

/**
 * Extract content type from base64 data URL
 * @param dataUrl - Base64 data URL
 * @returns Content type (e.g., 'image/jpeg')
 */
export function getContentTypeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:(image\/\w+);base64,/)
  return match ? match[1] : 'image/jpeg'
}
