#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createGzip, createBrotliCompress } from 'zlib'
import { promisify } from 'util'
import { pipeline } from 'stream'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pipelineAsync = promisify(pipeline)
const distDir = path.join(__dirname, '../dist')

// File types to compress
const COMPRESSIBLE_EXTENSIONS = [
  '.html', '.css', '.js', '.json', '.xml', '.svg', 
  '.txt', '.md', '.woff', '.woff2', '.ttf', '.eot'
]

// Minimum file size to compress (in bytes)
const MIN_COMPRESS_SIZE = 1024 // 1KB

async function compressFile(filePath, outputPath, compressionStream) {
  const readStream = fs.createReadStream(filePath)
  const writeStream = fs.createWriteStream(outputPath)
  
  await pipelineAsync(readStream, compressionStream, writeStream)
}

async function compressWithGzip(filePath) {
  const gzipPath = `${filePath}.gz`
  const gzipStream = createGzip({ level: 9 })
  
  await compressFile(filePath, gzipPath, gzipStream)
  
  const originalSize = fs.statSync(filePath).size
  const compressedSize = fs.statSync(gzipPath).size
  const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
  
  return { originalSize, compressedSize, savings, path: gzipPath }
}

async function compressWithBrotli(filePath) {
  const brotliPath = `${filePath}.br`
  const brotliStream = createBrotliCompress({
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: fs.statSync(filePath).size
    }
  })
  
  await compressFile(filePath, brotliPath, brotliStream)
  
  const originalSize = fs.statSync(filePath).size
  const compressedSize = fs.statSync(brotliPath).size
  const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
  
  return { originalSize, compressedSize, savings, path: brotliPath }
}

function findCompressibleFiles(dir) {
  const files = []
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir)
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else if (stat.isFile() && stat.size >= MIN_COMPRESS_SIZE) {
        const ext = path.extname(fullPath).toLowerCase()
        if (COMPRESSIBLE_EXTENSIONS.includes(ext)) {
          files.push(fullPath)
        }
      }
    })
  }
  
  walkDir(dir)
  return files
}

async function main() {
  console.log('🗜️  Starting asset compression...')
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ Dist directory not found. Please run build first.')
    process.exit(1)
  }
  
  const compressibleFiles = findCompressibleFiles(distDir)
  console.log(`Found ${compressibleFiles.length} files to compress`)
  
  if (compressibleFiles.length === 0) {
    console.log('No files found to compress')
    return
  }
  
  let totalOriginalSize = 0
  let totalGzipSize = 0
  let totalBrotliSize = 0
  let processedFiles = 0
  
  for (const filePath of compressibleFiles) {
    const relativePath = path.relative(distDir, filePath)
    console.log(`\nCompressing ${relativePath}...`)
    
    try {
      // Skip if already compressed
      if (filePath.endsWith('.gz') || filePath.endsWith('.br')) {
        continue
      }
      
      const originalSize = fs.statSync(filePath).size
      totalOriginalSize += originalSize
      
      // Gzip compression
      const gzipResult = await compressWithGzip(filePath)
      totalGzipSize += gzipResult.compressedSize
      console.log(`  → Gzip: ${gzipResult.savings}% savings (${originalSize} → ${gzipResult.compressedSize} bytes)`)
      
      // Brotli compression
      try {
        const brotliResult = await compressWithBrotli(filePath)
        totalBrotliSize += brotliResult.compressedSize
        console.log(`  → Brotli: ${brotliResult.savings}% savings (${originalSize} → ${brotliResult.compressedSize} bytes)`)
      } catch (error) {
        console.warn(`  ⚠️  Brotli compression failed: ${error.message}`)
      }
      
      processedFiles++
      
    } catch (error) {
      console.error(`❌ Failed to compress ${relativePath}: ${error.message}`)
    }
  }
  
  console.log('\n✅ Asset compression complete!')
  
  if (processedFiles > 0) {
    const gzipSavings = ((totalOriginalSize - totalGzipSize) / totalOriginalSize * 100).toFixed(1)
    const brotliSavings = totalBrotliSize > 0 ? ((totalOriginalSize - totalBrotliSize) / totalOriginalSize * 100).toFixed(1) : '0'
    
    console.log(`\n📊 Compression Summary:`)
    console.log(`  • Files processed: ${processedFiles}`)
    console.log(`  • Original total size: ${(totalOriginalSize / 1024).toFixed(1)} KB`)
    console.log(`  • Gzip total size: ${(totalGzipSize / 1024).toFixed(1)} KB (${gzipSavings}% savings)`)
    if (totalBrotliSize > 0) {
      console.log(`  • Brotli total size: ${(totalBrotliSize / 1024).toFixed(1)} KB (${brotliSavings}% savings)`)
    }
  }
}

// Import zlib constants fix
import zlib from 'zlib'

main().catch(console.error)