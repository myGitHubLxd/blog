import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'
import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-table-of-contents'
import markdownItPrism from 'markdown-it-prism'

// Initialize markdown parser with performance optimizations
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false, // Disable automatic line breaks for better performance
})
  .use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink()
  })
  .use(markdownItToc, {
    includeLevel: [2, 3, 4],
    containerClass: 'table-of-contents',
    markerPattern: /^\[\[toc\]\]/im
  })
  .use(markdownItPrism, {
    defaultLanguage: 'javascript'
  })

// Plugin to convert markdown to HTML with performance optimizations
function markdownPlugin() {
  return {
    name: 'markdown',
    configureServer(server) {
      server.middlewares.use('/articles', (req, res, next) => {
        if (req.url.endsWith('.md')) {
          const filePath = path.join(process.cwd(), 'articles', req.url)
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8')
            const html = md.render(content)
            res.setHeader('Content-Type', 'text/html')
            res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour in dev
            res.end(`
              <!DOCTYPE html>
              <html lang="zh-CN">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>bestswifter 的博客</title>
                <link rel="stylesheet" href="/styles/main.css">
                <link rel="stylesheet" href="/styles/prism.css">
              </head>
              <body>
                <main class="article-content">
                  ${html}
                </main>
                <script src="/js/main.js"></script>
              </body>
              </html>
            `)
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser',
    cssMinify: true,
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: ['prismjs'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false // Remove comments
      }
    }
  },
  
  server: {
    port: 3000,
    host: true,
    cors: true
  },
  
  plugins: [
    markdownPlugin(),
    
    // Copy static assets with optimization
    viteStaticCopy({
      targets: [
        {
          src: 'articles/*.md',
          dest: 'articles'
        }
      ]
    }),
    
    // PWA for performance and offline support
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,gif,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.bestswifter\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?optimized=true`
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },
      manifest: {
        name: 'bestswifter 的博客',
        short_name: 'bestswifter',
        description: 'iOS、Swift、前端开发技术博客',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  
  // CSS optimization
  css: {
    devSourcemap: false,
    modules: {
      generateScopedName: '[hash:base64:8]' // Shorter CSS class names
    }
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: ['prismjs'],
    exclude: []
  }
})