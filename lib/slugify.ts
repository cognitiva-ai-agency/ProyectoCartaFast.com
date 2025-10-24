/**
 * Convert a text string to a URL-friendly slug
 * Example: "Carne de Cerdo" → "carne-de-cerdo"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Generate a unique ingredient ID from name
 * Example: "Carne de Cerdo" → "carne-de-cerdo"
 * If ID already exists, append a number: "carne-de-cerdo-2"
 */
export function generateIngredientId(name: string, existingIds: string[] = []): string {
  const baseSlug = slugify(name)

  // If the base slug doesn't exist, use it
  if (!existingIds.includes(baseSlug)) {
    return baseSlug
  }

  // If it exists, try appending numbers until we find a unique one
  let counter = 2
  let newSlug = `${baseSlug}-${counter}`

  while (existingIds.includes(newSlug)) {
    counter++
    newSlug = `${baseSlug}-${counter}`
  }

  return newSlug
}
