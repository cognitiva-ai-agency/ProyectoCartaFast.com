/**
 * Script to migrate demo data to filesystem
 * Run with: npx ts-node --esm scripts/migrate-demo-data.ts
 */

import fs from 'fs'
import path from 'path'
import { DEMO_CATEGORIES, DEMO_ITEMS } from '../lib/demo-data.js'

const DATA_DIR = path.join(process.cwd(), 'data')
const RESTAURANT_DIR = path.join(DATA_DIR, 'restoran1')

// Ensure directories exist
if (!fs.existsSync(RESTAURANT_DIR)) {
  fs.mkdirSync(RESTAURANT_DIR, { recursive: true })
}

const imagesDir = path.join(RESTAURANT_DIR, 'images')
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

// Write categories
const categoriesPath = path.join(RESTAURANT_DIR, 'categories.json')
fs.writeFileSync(categoriesPath, JSON.stringify(DEMO_CATEGORIES, null, 2))
console.log('✅ Categories migrated:', DEMO_CATEGORIES.length)

// Write items
const itemsPath = path.join(RESTAURANT_DIR, 'items.json')
fs.writeFileSync(itemsPath, JSON.stringify(DEMO_ITEMS, null, 2))
console.log('✅ Items migrated:', DEMO_ITEMS.length)

console.log('\n✨ Migration complete!')
console.log(`📁 Data saved to: ${RESTAURANT_DIR}`)
