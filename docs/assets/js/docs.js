// Documentation JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize documentation features
    initializeNavigation();
    initializeCodeBlocks();
    initializeSearchFunctionality();
    initializePrintFunctionality();
    initializeTooltips();
});

/**
 * Initialize smooth scrolling navigation
 */
function initializeNavigation() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                history.pushState(null, null, this.getAttribute('href'));
            }
        });
    });

    // Active navigation highlighting based on scroll position
    window.addEventListener('scroll', throttle(updateActiveNavigation, 100));
    
    // Initial active navigation setup
    updateActiveNavigation();
}

/**
 * Update active navigation based on current scroll position
 */
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.sidebar a, .nav-links a');
    
    let current = '';
    const scrollPosition = window.scrollY + 200; // Offset for header
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    // Update active states
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize code block functionality
 */
function initializeCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block');
    
    codeBlocks.forEach(block => {
        // Add copy button to code blocks
        const copyButton = createCopyButton();
        block.style.position = 'relative';
        block.appendChild(copyButton);
        
        // Add syntax highlighting if Prism is available
        if (typeof Prism !== 'undefined') {
            const code = block.querySelector('code');
            if (code && !code.classList.contains('language-')) {
                code.classList.add('language-javascript');
                Prism.highlightElement(code);
            }
        }
    });
}

/**
 * Create copy button for code blocks
 */
function createCopyButton() {
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.innerHTML = '📋 Copy';
    button.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255,255,255,0.1);
        color: white;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
    `;
    
    button.addEventListener('click', function() {
        const codeBlock = this.parentElement;
        const code = codeBlock.querySelector('code');
        const text = code.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showCopyFeedback(this);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopyFeedback(this);
        }
    });
    
    button.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255,255,255,0.2)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255,255,255,0.1)';
    });
    
    return button;
}

/**
 * Show copy feedback animation
 */
function showCopyFeedback(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '✅ Copied!';
    button.style.background = 'rgba(16, 185, 129, 0.8)';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = 'rgba(255,255,255,0.1)';
    }, 2000);
}

/**
 * Initialize search functionality
 */
function initializeSearchFunctionality() {
    // Create search box if it doesn't exist
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !document.querySelector('.search-box')) {
        const searchBox = createSearchBox();
        sidebar.insertBefore(searchBox, sidebar.firstChild);
    }
}

/**
 * Create search box element
 */
function createSearchBox() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.style.cssText = `
        margin-bottom: 1.5rem;
        position: relative;
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search documentation...';
    searchInput.className = 'search-box';
    searchInput.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 14px;
        background: #f8fafc;
        transition: all 0.2s;
    `;
    
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchResults.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 2) {
            performSearch(query, searchResults);
        } else {
            searchResults.style.display = 'none';
        }
    });
    
    searchInput.addEventListener('focus', function() {
        this.style.borderColor = '#3b82f6';
        this.style.background = 'white';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.borderColor = '#e2e8f0';
        this.style.background = '#f8fafc';
        // Delay hiding results to allow clicking
        setTimeout(() => {
            searchResults.style.display = 'none';
        }, 200);
    });
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchResults);
    
    return searchContainer;
}

/**
 * Perform search in documentation content
 */
function performSearch(query, resultsContainer) {
    const sections = document.querySelectorAll('section[id]');
    const results = [];
    
    sections.forEach(section => {
        const id = section.getAttribute('id');
        const heading = section.querySelector('h1, h2, h3');
        const content = section.textContent.toLowerCase();
        
        if (content.includes(query.toLowerCase())) {
            const title = heading ? heading.textContent : id;
            const snippet = extractSnippet(section.textContent, query);
            results.push({
                id: id,
                title: title,
                snippet: snippet
            });
        }
    });
    
    displaySearchResults(results, resultsContainer);
}

/**
 * Extract relevant snippet from content
 */
function extractSnippet(content, query) {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    
    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    // Highlight the query term
    const regex = new RegExp(`(${query})`, 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');
    
    return snippet;
}

/**
 * Display search results
 */
function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div style="padding: 12px; color: #64748b;">No results found</div>';
    } else {
        container.innerHTML = results.map(result => `
            <div class="search-result" style="padding: 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer;" onclick="navigateToSection('${result.id}')">
                <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${result.title}</div>
                <div style="font-size: 12px; color: #64748b;">${result.snippet}</div>
            </div>
        `).join('');
    }
    
    container.style.display = 'block';
}

/**
 * Navigate to specific section
 */
function navigateToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, null, `#${sectionId}`);
    }
    
    // Hide search results
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

/**
 * Initialize print functionality
 */
function initializePrintFunctionality() {
    // Add print button if needed
    const content = document.querySelector('.content');
    if (content && !document.querySelector('.print-btn')) {
        const printButton = createPrintButton();
        const h1 = content.querySelector('h1');
        if (h1) {
            h1.style.position = 'relative';
            h1.appendChild(printButton);
        }
    }
}

/**
 * Create print button
 */
function createPrintButton() {
    const button = document.createElement('button');
    button.className = 'print-btn';
    button.innerHTML = '🖨️ Print';
    button.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
    `;
    
    button.addEventListener('click', function() {
        window.print();
    });
    
    button.addEventListener('mouseenter', function() {
        this.style.background = '#e2e8f0';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.background = '#f8fafc';
    });
    
    return button;
}

/**
 * Initialize tooltips for badges and special elements
 */
function initializeTooltips() {
    const badges = document.querySelectorAll('.badge');
    
    badges.forEach(badge => {
        let tooltipText = '';
        
        if (badge.classList.contains('badge-new')) {
            tooltipText = 'New feature in this version';
        } else if (badge.classList.contains('badge-pro')) {
            tooltipText = 'Pro feature - available in professional license';
        } else if (badge.classList.contains('badge-required')) {
            tooltipText = 'Required field or configuration';
        }
        
        if (tooltipText) {
            badge.title = tooltipText;
            badge.style.cursor = 'help';
        }
    });
}

/**
 * Throttle function for performance optimization
 */
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Toggle mobile navigation
 */
function toggleMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

/**
 * Initialize mobile navigation if on mobile device
 */
function initializeMobileNavigation() {
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
            
            // Create mobile nav toggle
            const navToggle = document.createElement('button');
            navToggle.innerHTML = '☰ Menu';
            navToggle.style.cssText = `
                display: block;
                margin: 1rem 0;
                padding: 8px 16px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            `;
            
            navToggle.addEventListener('click', function() {
                const isVisible = sidebar.style.display !== 'none';
                sidebar.style.display = isVisible ? 'none' : 'block';
                this.innerHTML = isVisible ? '☰ Menu' : '✕ Close';
            });
            
            const content = document.querySelector('.content');
            content.insertBefore(navToggle, content.firstChild);
        }
    }
}

// Initialize mobile navigation on load and resize
window.addEventListener('load', initializeMobileNavigation);
window.addEventListener('resize', throttle(initializeMobileNavigation, 250));

// Export functions for global access
window.navigateToSection = navigateToSection;
window.toggleMobileNav = toggleMobileNav;