#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import https from 'https'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const articlesDir = path.join(__dirname, '../articles')
const imagesDir = path.join(__dirname, '../public/images')
const optimizedDir = path.join(imagesDir, 'optimized')

// Ensure directories exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true })
}

// Configuration for image optimization
const OPTIMIZATION_CONFIG = {
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true
  },
  png: {
    quality: 90,
    compressionLevel: 9,
    adaptiveFiltering: true
  },
  webp: {
    quality: 85,
    effort: 6
  },
  avif: {
    quality: 80,
    effort: 6
  }
}

// Extract image URLs from markdown files
function extractImageUrls() {
  const imageUrls = new Set()
  const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'))
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8')
    
    // Match markdown image syntax: ![alt](url)
    const imageRegex = /!\[.*?\]\((https?:\/\/[^)]+\.(png|jpg|jpeg|gif|svg|webp))[^)]*\)/gi
    let match
    
    while ((match = imageRegex.exec(content)) !== null) {
      imageUrls.add(match[1])
    }
  })
  
  return Array.from(imageUrls)
}

// Download image from URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`))
        return
      }
      
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    }).on('error', reject)
  })
}

// Optimize single image
async function optimizeImage(imageBuffer, filename) {
  const baseName = path.parse(filename).name
  const results = {}
  
  try {
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()
    
    console.log(`Optimizing ${filename} (${metadata.width}x${metadata.height}, ${metadata.format})`)
    
    // Generate WebP version (best compression for modern browsers)
    const webpBuffer = await image
      .webp(OPTIMIZATION_CONFIG.webp)
      .toBuffer()
    
    const webpPath = path.join(optimizedDir, `${baseName}.webp`)
    fs.writeFileSync(webpPath, webpBuffer)
    results.webp = webpPath
    
    // Generate AVIF version (even better compression for newest browsers)
    try {
      const avifBuffer = await image
        .avif(OPTIMIZATION_CONFIG.avif)
        .toBuffer()
      
      const avifPath = path.join(optimizedDir, `${baseName}.avif`)
      fs.writeFileSync(avifPath, avifBuffer)
      results.avif = avifPath
    } catch (error) {
      console.warn(`Could not create AVIF for ${filename}:`, error.message)
    }
    
    // Generate optimized fallback in original format
    let optimizedBuffer
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      optimizedBuffer = await image
        .jpeg(OPTIMIZATION_CONFIG.jpeg)
        .toBuffer()
      results.fallback = path.join(optimizedDir, `${baseName}.jpg`)
    } else if (metadata.format === 'png') {
      optimizedBuffer = await image
        .png(OPTIMIZATION_CONFIG.png)
        .toBuffer()
      results.fallback = path.join(optimizedDir, `${baseName}.png`)
    } else {
      // For other formats, convert to WebP only
      optimizedBuffer = webpBuffer
      results.fallback = webpPath
    }
    
    if (results.fallback && results.fallback !== webpPath) {
      fs.writeFileSync(results.fallback, optimizedBuffer)
    }
    
    // Calculate compression savings
    const originalSize = imageBuffer.length
    const optimizedSize = webpBuffer.length
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1)
    
    console.log(`  → Saved ${savings}% (${originalSize} → ${optimizedSize} bytes)`)
    
    return results
  } catch (error) {
    console.error(`Error optimizing ${filename}:`, error.message)
    return null
  }
}

// Update markdown files with optimized image references
function updateMarkdownFiles(imageMap) {
  const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'))
  
  files.forEach(file => {
    const filePath = path.join(articlesDir, file)
    let content = fs.readFileSync(filePath, 'utf-8')
    let modified = false
    
    Object.entries(imageMap).forEach(([originalUrl, optimizedPaths]) => {
      if (!optimizedPaths) return
      
      const baseName = path.parse(new URL(originalUrl).pathname).name
      
      // Create responsive image HTML with multiple formats
      const responsiveImage = `
<picture>
  ${optimizedPaths.avif ? `<source srcset="/images/optimized/${baseName}.avif" type="image/avif">` : ''}
  <source srcset="/images/optimized/${baseName}.webp" type="image/webp">
  <img src="/images/optimized/${path.basename(optimizedPaths.fallback)}" 
       alt="${baseName}" 
       loading="lazy" 
       decoding="async">
</picture>`.trim()
      
      // Replace markdown image syntax with optimized HTML
      const imageRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\)`, 'g')
      
      if (imageRegex.test(content)) {
        content = content.replace(imageRegex, responsiveImage)
        modified = true
      }
    })
    
    if (modified) {
      fs.writeFileSync(filePath, content)
      console.log(`Updated ${file} with optimized images`)
    }
  })
}

// Main optimization process
async function main() {
  console.log('🖼️  Starting image optimization...')
  
  const imageUrls = extractImageUrls()
  console.log(`Found ${imageUrls.length} external images to optimize`)
  
  if (imageUrls.length === 0) {
    console.log('No external images found to optimize')
    return
  }
  
  const imageMap = {}
  
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]
    const filename = path.basename(new URL(url).pathname)
    
    console.log(`\n[${i + 1}/${imageUrls.length}] Processing ${filename}...`)
    
    try {
      // Check if already optimized
      const baseName = path.parse(filename).name
      const webpPath = path.join(optimizedDir, `${baseName}.webp`)
      
      if (fs.existsSync(webpPath)) {
        console.log(`  → Already optimized, skipping`)
        imageMap[url] = {
          webp: webpPath,
          fallback: webpPath
        }
        continue
      }
      
      // Download and optimize
      const imageBuffer = await downloadImage(url)
      const optimizedPaths = await optimizeImage(imageBuffer, filename)
      
      imageMap[url] = optimizedPaths
      
      // Add small delay to be respectful to servers
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`Failed to process ${url}:`, error.message)
      imageMap[url] = null
    }
  }
  
  // Update markdown files with optimized references
  console.log('\n📝 Updating markdown files...')
  updateMarkdownFiles(imageMap)
  
  console.log('\n✅ Image optimization complete!')
  
  // Generate optimization report
  const totalOptimized = Object.values(imageMap).filter(Boolean).length
  console.log(`\n📊 Optimization Summary:`)
  console.log(`  • Images processed: ${imageUrls.length}`)
  console.log(`  • Successfully optimized: ${totalOptimized}`)
  console.log(`  • Failed: ${imageUrls.length - totalOptimized}`)
  console.log(`  • Output directory: ${optimizedDir}`)
}

// Run optimization
main().catch(console.error)