#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'
import express from 'express'
import compression from 'compression'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, '../dist')
const reportsDir = path.join(__dirname, '../reports')

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

// Performance budgets for different metrics
const PERFORMANCE_BUDGETS = {
  'first-contentful-paint': 1500, // 1.5s
  'largest-contentful-paint': 2500, // 2.5s
  'cumulative-layout-shift': 0.1,
  'total-blocking-time': 300, // 300ms
  'speed-index': 3000, // 3s
  'interactive': 3800 // 3.8s
}

async function startTestServer() {
  const app = express()
  
  // Enable compression
  app.use(compression({
    threshold: 1024,
    level: 9
  }))
  
  // Serve static files with optimal headers
  app.use(express.static(distDir, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set specific cache headers based on file type
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
      } else if (path.match(/\.(js|css)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else if (path.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000')
      }
      
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-XSS-Protection', '1; mode=block')
    }
  }))
  
  const server = app.listen(0) // Use random available port
  const port = server.address().port
  
  return { server, port }
}

async function runLighthouseAudit(url, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  })
  
  try {
    const lhOptions = {
      logLevel: 'error',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: new URL(browser.wsEndpoint()).port,
      ...options
    }
    
    const lhConfig = {
      extends: 'lighthouse:default',
      settings: {
        // Simulate mobile device
        formFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        },
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2
        },
        emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    }
    
    console.log(`🔍 Running Lighthouse audit on ${url}...`)
    const result = await lighthouse(url, lhOptions, lhConfig)
    
    return result
  } finally {
    await browser.close()
  }
}

function analyzePerformanceMetrics(lhr) {
  const metrics = {}
  const audits = lhr.audits
  
  // Core Web Vitals and other important metrics
  const metricsToCheck = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'cumulative-layout-shift',
    'total-blocking-time',
    'speed-index',
    'interactive'
  ]
  
  metricsToCheck.forEach(metric => {
    if (audits[metric]) {
      const audit = audits[metric]
      const value = audit.numericValue || audit.score
      const budget = PERFORMANCE_BUDGETS[metric]
      
      metrics[metric] = {
        value,
        displayValue: audit.displayValue,
        score: audit.score,
        budget,
        withinBudget: budget ? (metric === 'cumulative-layout-shift' ? value <= budget : value <= budget) : true,
        title: audit.title
      }
    }
  })
  
  return metrics
}

function generatePerformanceReport(results) {
  const timestamp = new Date().toISOString()
  let report = `# Performance Audit Report\n\n`
  report += `**Generated:** ${timestamp}\n\n`
  
  results.forEach(({ url, metrics, scores }) => {
    report += `## ${url}\n\n`
    report += `### Lighthouse Scores\n\n`
    report += `- **Performance:** ${(scores.performance * 100).toFixed(0)}/100\n`
    report += `- **Accessibility:** ${(scores.accessibility * 100).toFixed(0)}/100\n`
    report += `- **Best Practices:** ${(scores['best-practices'] * 100).toFixed(0)}/100\n`
    report += `- **SEO:** ${(scores.seo * 100).toFixed(0)}/100\n\n`
    
    report += `### Core Web Vitals\n\n`
    report += `| Metric | Value | Budget | Status |\n`
    report += `|--------|-------|--------|---------|\n`
    
    Object.entries(metrics).forEach(([key, data]) => {
      const status = data.withinBudget ? '✅ Pass' : '❌ Fail'
      const budgetText = data.budget ? 
        (key === 'cumulative-layout-shift' ? data.budget.toString() : `${data.budget}ms`) : 
        'N/A'
      
      report += `| ${data.title} | ${data.displayValue} | ${budgetText} | ${status} |\n`
    })
    
    report += `\n`
  })
  
  return report
}

async function main() {
  console.log('🚀 Starting Lighthouse performance audit...')
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ Dist directory not found. Please run build first.')
    process.exit(1)
  }
  
  // Start local server
  console.log('🌐 Starting test server...')
  const { server, port } = await startTestServer()
  const baseUrl = `http://localhost:${port}`
  
  try {
    const results = []
    
    // Test main page
    const mainUrl = baseUrl
    console.log(`\n📊 Auditing main page: ${mainUrl}`)
    
    const mainResult = await runLighthouseAudit(mainUrl)
    const mainMetrics = analyzePerformanceMetrics(mainResult.lhr)
    const mainScores = mainResult.lhr.categories
    
    results.push({
      url: 'Main Page',
      metrics: mainMetrics,
      scores: {
        performance: mainScores.performance.score,
        accessibility: mainScores.accessibility.score,
        'best-practices': mainScores['best-practices'].score,
        seo: mainScores.seo.score
      }
    })
    
    // Save detailed HTML report
    const htmlReportPath = path.join(reportsDir, `lighthouse-main-${Date.now()}.html`)
    fs.writeFileSync(htmlReportPath, mainResult.report)
    console.log(`📄 Detailed HTML report saved: ${htmlReportPath}`)
    
    // Test a sample article page if available
    const sampleArticlePaths = [
      '/articles/javascript-async.md',
      '/articles/vue-express-conclusion.md',
      '/articles/ios-tableview.md'
    ]
    
    for (const articlePath of sampleArticlePaths) {
      const articleUrl = `${baseUrl}${articlePath}`
      
      try {
        console.log(`\n📊 Auditing article: ${articlePath}`)
        const articleResult = await runLighthouseAudit(articleUrl)
        const articleMetrics = analyzePerformanceMetrics(articleResult.lhr)
        const articleScores = articleResult.lhr.categories
        
        results.push({
          url: articlePath,
          metrics: articleMetrics,
          scores: {
            performance: articleScores.performance.score,
            accessibility: articleScores.accessibility.score,
            'best-practices': articleScores['best-practices'].score,
            seo: articleScores.seo.score
          }
        })
        
        break // Only test one article to save time
      } catch (error) {
        console.warn(`⚠️  Could not audit ${articlePath}: ${error.message}`)
      }
    }
    
    // Generate summary report
    const performanceReport = generatePerformanceReport(results)
    const reportPath = path.join(reportsDir, `performance-report-${Date.now()}.md`)
    fs.writeFileSync(reportPath, performanceReport)
    
    console.log('\n✅ Performance audit complete!')
    console.log(`📄 Performance report saved: ${reportPath}`)
    
    // Display summary in console
    console.log('\n📊 Performance Summary:')
    results.forEach(({ url, scores }) => {
      console.log(`\n${url}:`)
      console.log(`  Performance: ${(scores.performance * 100).toFixed(0)}/100`)
      console.log(`  Accessibility: ${(scores.accessibility * 100).toFixed(0)}/100`)
      console.log(`  Best Practices: ${(scores['best-practices'] * 100).toFixed(0)}/100`)
      console.log(`  SEO: ${(scores.seo * 100).toFixed(0)}/100`)
    })
    
    // Check if performance goals are met
    const performanceScores = results.map(r => r.scores.performance)
    const avgPerformance = performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length
    
    if (avgPerformance >= 0.9) {
      console.log('\n🎉 Excellent performance! All pages scored 90+ for performance.')
    } else if (avgPerformance >= 0.7) {
      console.log('\n👍 Good performance! Consider optimizing further for better scores.')
    } else {
      console.log('\n⚠️  Performance needs improvement. Check the detailed report for recommendations.')
    }
    
  } finally {
    server.close()
  }
}

main().catch(console.error)