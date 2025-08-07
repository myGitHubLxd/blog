// Performance-optimized JavaScript for the blog
(function() {
    'use strict';
    
    // Feature detection and polyfills
    const supportsIntersectionObserver = 'IntersectionObserver' in window;
    const supportsWebP = (() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();
    
    // Performance monitoring
    const perf = {
        start: performance.now(),
        marks: {},
        
        mark(name) {
            this.marks[name] = performance.now();
        },
        
        measure(name, startMark) {
            const start = this.marks[startMark] || this.start;
            const duration = performance.now() - start;
            console.log(`${name}: ${duration.toFixed(2)}ms`);
            return duration;
        }
    };
    
    perf.mark('script-start');
    
    // Lazy loading for images with Intersection Observer
    function initLazyLoading() {
        if (!supportsIntersectionObserver) {
            // Fallback: load all images immediately
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
            return;
        }
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load the image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Handle responsive images
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }
                    
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        // Observe all lazy images
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }
    
    // Reading progress indicator
    function initReadingProgress() {
        const article = document.querySelector('.article-content');
        if (!article) return;
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
        document.body.appendChild(progressBar);
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .reading-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(37, 99, 235, 0.1);
                z-index: 1000;
            }
            .reading-progress-bar {
                height: 100%;
                background: #2563eb;
                width: 0%;
                transition: width 0.1s ease;
            }
        `;
        document.head.appendChild(style);
        
        const progressBarInner = progressBar.querySelector('.reading-progress-bar');
        
        // Throttled scroll handler
        let ticking = false;
        function updateProgress() {
            const scrollTop = window.pageYOffset;
            const docHeight = article.offsetHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = scrollTop / (docHeight - winHeight);
            const progress = Math.min(100, Math.max(0, scrollPercent * 100));
            
            progressBarInner.style.width = progress + '%';
            ticking = false;
        }
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        });
    }
    
    // Copy code button for code blocks
    function initCodeCopy() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(block => {
            const pre = block.parentElement;
            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.textContent = '复制';
            button.setAttribute('aria-label', '复制代码');
            
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(block.textContent);
                    button.textContent = '已复制!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.textContent = '复制';
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = block.textContent;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    button.textContent = '已复制!';
                    setTimeout(() => {
                        button.textContent = '复制';
                    }, 2000);
                }
            });
            
            pre.style.position = 'relative';
            pre.appendChild(button);
        });
        
        // Add CSS for copy button
        const style = document.createElement('style');
        style.textContent = `
            .copy-code-btn {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: rgba(255, 255, 255, 0.1);
                color: #e2e8f0;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .copy-code-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            .copy-code-btn.copied {
                background: #10b981;
                border-color: #10b981;
            }
        `;
        document.head.appendChild(style);
    }
    
    // External link handling
    function initExternalLinks() {
        const externalLinks = document.querySelectorAll('a[href^="http"]');
        
        externalLinks.forEach(link => {
            // Add external link indicator
            if (!link.hostname.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                link.classList.add('external-link');
                
                // Add icon
                const icon = document.createElement('span');
                icon.innerHTML = ' ↗';
                icon.setAttribute('aria-hidden', 'true');
                link.appendChild(icon);
            }
        });
    }
    
    // Table of contents generation
    function generateTableOfContents() {
        const article = document.querySelector('.article-content');
        if (!article) return;
        
        const headings = article.querySelectorAll('h2, h3, h4');
        if (headings.length < 3) return; // Don't generate TOC for short articles
        
        const toc = document.createElement('nav');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h3>目录</h3><ul></ul>';
        
        const list = toc.querySelector('ul');
        
        headings.forEach((heading, index) => {
            // Generate ID if not present
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
            
            const li = document.createElement('li');
            li.className = `toc-${heading.tagName.toLowerCase()}`;
            
            const a = document.createElement('a');
            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;
            
            li.appendChild(a);
            list.appendChild(li);
        });
        
        // Insert TOC after first paragraph
        const firstParagraph = article.querySelector('p');
        if (firstParagraph) {
            firstParagraph.parentNode.insertBefore(toc, firstParagraph.nextSibling);
        }
        
        // Add CSS for TOC
        const style = document.createElement('style');
        style.textContent = `
            .toc-h3 { margin-left: 1rem; }
            .toc-h4 { margin-left: 2rem; }
            .table-of-contents a {
                display: block;
                padding: 0.25rem 0;
                color: #2563eb;
                text-decoration: none;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            .table-of-contents a:hover {
                background-color: rgba(37, 99, 235, 0.1);
                padding-left: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Performance optimization: defer non-critical operations
    function deferNonCritical() {
        // Use requestIdleCallback if available, otherwise setTimeout
        const defer = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
        
        defer(() => {
            perf.mark('non-critical-start');
            
            initCodeCopy();
            initExternalLinks();
            generateTableOfContents();
            
            perf.measure('non-critical-operations', 'non-critical-start');
        });
    }
    
    // Initialize everything when DOM is ready
    function init() {
        perf.mark('init-start');
        
        // Critical operations first
        initLazyLoading();
        initSmoothScrolling();
        initReadingProgress();
        
        // Non-critical operations deferred
        deferNonCritical();
        
        perf.measure('initialization', 'init-start');
        perf.measure('total-script-time', 'script-start');
        
        // Log performance metrics in development
        if (window.location.hostname === 'localhost') {
            console.log('Performance metrics:', perf.marks);
        }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Web Vitals reporting (simplified)
    function reportWebVitals() {
        // Report Core Web Vitals to analytics
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });
            
            // Cumulative Layout Shift
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                console.log('CLS:', clsValue);
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    // Initialize Web Vitals reporting
    if (window.location.hostname !== 'localhost') {
        reportWebVitals();
    }
    
})();