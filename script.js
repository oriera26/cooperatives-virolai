// Cooperativa Marató TV3 - Script Principal
document.addEventListener('DOMContentLoaded', function() {
    // Carregar la navbar primer
    loadNavbar().then(() => {
        // Un cop la navbar està carregada, inicialitzar totes les funcionalitats
        initNavbar();
        initCounters();
        initScrollAnimations();
        initForms();
        initEventListeners();
        
        // Inicialitzar funcionalitats específiques de pàgines
        if (document.querySelector('.countdown')) {
            initCountdown();
        }
        
        if (document.querySelector('.news-filters') || document.querySelector('.events-filters')) {
            initFilters();
        }

        // Inicialització de càrrega de dades per a comptadors (euros, voluntaris, etc.)
        initData(); 
        iniciarTicker();
    });
});

// Funció per carregar la navbar
function loadNavbar() {
    return fetch('navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('No s\'ha pogut carregar la navbar');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => {
            console.error('Error carregant la navbar:', error);
            // Fallback: Crear una navbar bàsica si no es pot carregar
            document.getElementById('navbar-container').innerHTML = `
                <nav class="navbar">
                    <div class="nav-container">
                        <div class="nav-logo">
                            <a href="index.html" class="logo-link">
                                <span class="logo-text">Cooperativa Virolai</span>
                                <span class="logo-highlight">Onada Solidària</span>
                            </a>
                        </div>
                        <div class="nav-toggle">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </nav>
            `;
        });
}

function iniciarTicker() {
    const div = document.querySelector('#emails');
    if (!div) return;
    
    const paragrafs = div.querySelectorAll('p');
    let indexActual = 0;

    // Amaga tots els paràgrafs inicialment afegint una classe
    paragrafs.forEach(p => p.classList.add('amagat'));

    // Mostra el primer element
    if (paragrafs.length > 0) {
        paragrafs[indexActual].classList.remove('amagat');
        paragrafs[indexActual].classList.add('visible');
    }

    setInterval(() => {
        if (paragrafs.length === 0) return;
        
        // Amaga el paràgraf actual
        paragrafs[indexActual].classList.add('amagat');
        paragrafs[indexActual].classList.remove('visible');

        // Avança a el següent paràgraf
        indexActual = (indexActual + 1) % paragrafs.length;

        // Mostra el nou paràgraf actual
        paragrafs[indexActual].classList.remove('amagat');
        paragrafs[indexActual].classList.add('visible');
    }, 3000);
}

// Navbar i menú mòbil
function initNavbar() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Tancar el menú en fer clic en un enllaç (mòbil)
            if (navMenu.classList.contains('active')) {
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                    });
                });
            }
        });
    }
    
    // Tancar menú en fer clic fora (mòbil)
    document.addEventListener('click', function(e) {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu && navMenu.classList.contains('active')) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        }
    });
}

// Sistema de Cerca Millorat - Presentació Optimitzada
class SearchSystem {
    constructor() {
        this.searchIndex = [];
        this.isIndexed = false;
        this.pagesToIndex = [
            'index.html',
            'events.html', 
            'news.html'
        ];
        this.minContentLength = 10;
    }

    async init() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput || !searchResults) {
            console.warn('Elements de cerca no trobats');
            return;
        }

        await this.buildSearchIndex();

        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        this.processStoredSearch();
    }

    async buildSearchIndex() {
        if (this.isIndexed) return;

        try {
            console.log('Començant a indexar pàgines...');
            for (const pageUrl of this.pagesToIndex) {
                await this.indexPage(pageUrl);
            }
            this.isIndexed = true;
            console.log('Índex de cerca construït:', this.searchIndex.length, 'elements');
        } catch (error) {
            console.error('Error construint índex de cerca:', error);
        }
    }

    async indexPage(pageUrl) {
        try {
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const elementsToRemove = doc.querySelectorAll(
                'nav, footer, script, style, .navbar, .footer, .nav-menu, .nav-actions, .search-container, .nav-toggle, .page-hero, .pagination, .news-filters, .events-filters, .filter-btn, .section-footer, .hero-scroll, .countdown-container, .cta-events, .footer-section, .footer-bottom, .social-links, .logo-link, .nav-logo'
            );
            elementsToRemove.forEach(el => el.remove());

            this.indexAllContentElements(doc, pageUrl);

        } catch (error) {
            console.warn(`No s'ha pogut indexar ${pageUrl}:`, error);
        }
    }

    indexAllContentElements(doc, pageUrl) {
        const contentSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'div', 'section', 'article', 'main',
            'li', 'ul', 'ol',
            'td', 'th', 'tr',
            'strong', 'b', 'em', 'i', 'mark',
            'a', 'button',
            'blockquote', 'cite',
            'figcaption', 'caption',
            '.event-title', '.news-title', '.stat-label', '.event-description', '.news-excerpt',
            '.event-content', '.news-content', '.about-content', '.contact-info', '.feature-item',
            '.hero-title', '.hero-subtitle', '.section-header h2', '.section-header p',
            '.event-date', '.news-date', '.event-location', '.event-meta',
            '.contact-details', '.visual-card', '.featured-info h2', '.featured-info h3',
            '.event-details-full', '.news-meta', '.read-more', '.btn', '.stat-number',
            '.about-actions', '.event-info', '.detail-item', '.countdown-label'
        ];

        const allElements = doc.querySelectorAll(contentSelectors.join(', '));
        
        console.log(`Trobats ${allElements.length} elements a indexar a ${pageUrl}`);
        
        allElements.forEach(element => {
            this.indexElementIfValid(element, pageUrl);
        });
    }

    indexElementIfValid(element, pageUrl) {
        const content = this.extractTextContent(element);
        
        if (content && content.length >= this.minContentLength) {
            const title = this.extractElementTitle(element);
            const elementType = this.getElementType(element);
            const importance = this.calculateElementImportance(element, elementType);
            
            // Evitar duplicats: si el contingut és igual al títol, no afegir contingut
            const finalContent = content !== title ? content : '';
            
            this.searchIndex.push({
                title: title,
                content: finalContent,
                url: pageUrl,
                anchor: this.getElementAnchor(element),
                elementId: element.id || null,
                type: elementType,
                importance: importance,
                tagName: element.tagName.toLowerCase(),
                className: element.className || ''
            });
        }
    }

    extractTextContent(element) {
        const clone = element.cloneNode(true);
        
        const elementsToRemove = clone.querySelectorAll(
            'script, style, nav, footer, .navbar, .footer, .nav-menu, .btn, .read-more, .search-container'
        );
        elementsToRemove.forEach(el => el.remove());
        
        return clone.textContent.trim().replace(/\s+/g, ' ');
    }

    extractElementTitle(element) {
        // Per als encapçalaments, retornar el text directament
        if (element.tagName.match(/^H[1-6]$/i)) {
            return element.textContent.trim();
        }
        
        // Per a elements amb classe de títol
        if (element.classList.contains('event-title') || 
            element.classList.contains('news-title') ||
            element.classList.contains('hero-title') ||
            element.classList.contains('stat-label')) {
            return element.textContent.trim();
        }
        
        // Buscar un títol proper
        const parentTitle = element.closest('.event-card, .news-card, .stat-card, .feature-item');
        if (parentTitle) {
            const titleElement = parentTitle.querySelector('.event-title, .news-title, h2, h3, h4');
            if (titleElement) {
                return titleElement.textContent.trim();
            }
        }
        
        // Per a paràgrafs i contingut, retornar les primeres paraules
        const content = this.extractTextContent(element);
        if (content.length > 100) {
            // Trobar un punt de tall natural ( després d'una frase)
            const sentences = content.split(/[.!?]+/);
            if (sentences[0].length > 20) {
                return sentences[0].trim() + (sentences[0].endsWith('.') ? '' : '.');
            }
        }
        
        return content.length > 80 ? content.substring(0, 80) + '...' : content;
    }

    getElementType(element) {
        const tag = element.tagName.toLowerCase();
        const className = element.className || '';
        
        if (tag.match(/^h[1-6]$/)) return 'heading';
        if (tag === 'p') return 'paragraph';
        if (tag === 'li') return 'list-item';
        if (tag === 'td' || tag === 'th') return 'table-cell';
        if (className.includes('event-') || className.includes('news-')) return 'card-content';
        if (className.includes('title')) return 'title';
        if (className.includes('description') || className.includes('excerpt')) return 'description';
        if (className.includes('content')) return 'content';
        if (className.includes('meta')) return 'meta';
        if (className.includes('stat-')) return 'statistic';
        
        return 'content';
    }

    calculateElementImportance(element, elementType) {
        let importance = 1;
        
        switch(elementType) {
            case 'heading':
                const level = parseInt(element.tagName.charAt(1));
                importance += (6 - level) * 2;
                break;
            case 'title':
                importance += 3;
                break;
            case 'statistic':
                importance += 2;
                break;
            case 'card-content':
                importance += 1.5;
                break;
            case 'description':
                importance += 1;
                break;
        }
        
        if (element.classList.contains('hero-title')) importance += 4;
        if (element.classList.contains('section-header')) importance += 3;
        if (element.classList.contains('event-title') || element.classList.contains('news-title')) importance += 2;
        
        return importance;
    }

    getElementAnchor(element) {
        if (element.id) return element.id;
        
        const parentWithId = element.closest('[id]');
        if (parentWithId) return parentWithId.id;
        
        const content = this.extractTextContent(element);
        return this.generateContentHash(content);
    }

    generateContentHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'content-' + Math.abs(hash);
    }

    handleSearch(query) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        const normalizedQuery = query.toLowerCase().trim();
        
        if (normalizedQuery.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const results = this.searchIndex
            .filter(item => 
                item.title.toLowerCase().includes(normalizedQuery) || 
                (item.content && item.content.toLowerCase().includes(normalizedQuery))
            )
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 8); // Reduïm a 8 resultats per a més claredat

        this.displaySearchResults(results, normalizedQuery);
    }

    displaySearchResults(results, query) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No s\'han trobat resultats</div>';
            searchResults.style.display = 'block';
            return;
        }

        searchResults.innerHTML = results.map(item => {
            const hasContent = item.content && item.content !== item.title;
            
            return `
                <div class="search-result-item" onclick="window.searchSystem.navigateToResult('${item.url}', '${item.anchor}', '${this.escapeHtml(query)}')">
                    <div class="search-result-main">
                        <div class="search-result-title">${this.highlightText(item.title, query)}</div>
                        ${hasContent ? 
                            `<div class="search-result-content">${this.highlightText(this.truncateText(item.content, 120), query)}</div>` 
                            : ''
                        }
                    </div>
                    <div class="search-result-footer">
                        <span class="search-result-badge search-result-${item.type}">${this.getTypeLabel(item.type)}</span>
                        <span class="search-result-source">${this.getPageName(item.url)}</span>
                    </div>
                </div>
            `;
        }).join('');

        searchResults.style.display = 'block';
    }

    getTypeLabel(type) {
        const labels = {
            'heading': '📖 Títol',
            'paragraph': '📝 Text',
            'list-item': '📋 Llista',
            'table-cell': '📊 Taula',
            'card-content': '🎴 Targeta',
            'title': '🏷️ Títol',
            'description': '📄 Descripció',
            'content': '📃 Contingut',
            'meta': '🔍 Meta',
            'statistic': '📊 Estadística'
        };
        return labels[type] || '📄 Contingut';
    }

    navigateToResult(url, anchor, query) {
        if (window.location.pathname.endsWith(url) || (url === 'index.html' && window.location.pathname.endsWith('/'))) {
            this.highlightAndScrollToElement(anchor, query);
        } else {
            sessionStorage.setItem('searchData', JSON.stringify({
                anchor: anchor,
                query: query,
                timestamp: Date.now()
            }));
            
            window.location.href = url + (anchor ? `#${anchor}` : '');
        }
    }

    highlightAndScrollToElement(anchor, query) {
        let element = document.getElementById(anchor);
        
        if (!element) {
            element = this.findElementByContentHash(anchor);
        }

        if (element) {
            const offsetTop = element.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            this.highlightElement(element);
            
            if (query && query.length >= 2) {
                this.highlightTextInElement(element, query);
            }
        }
    }

    findElementByContentHash(hash) {
        const contentItems = this.searchIndex.filter(item => item.anchor === hash);
        if (contentItems.length > 0) {
            const targetContent = contentItems[0].content.substring(0, 100);
            const allElements = document.querySelectorAll('*');
            
            for (const element of allElements) {
                if (element.textContent && element.textContent.includes(targetContent.substring(0, 50))) {
                    return element;
                }
            }
        }
        return null;
    }

    highlightElement(element) {
        const originalBackground = element.style.backgroundColor;
        const originalTransition = element.style.transition;
        
        element.style.backgroundColor = '#ffeb3b';
        element.style.transition = 'background-color 0.5s ease';
        
        setTimeout(() => {
            element.style.backgroundColor = originalBackground;
            element.style.transition = originalTransition;
        }, 3000);
    }

    highlightTextInElement(element, query) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        const nodes = [];
        
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(query.toLowerCase())) {
                nodes.push(node);
            }
        }
        
        nodes.forEach(node => {
            const span = document.createElement('span');
            span.innerHTML = node.textContent.replace(
                new RegExp(`(${this.escapeRegExp(query)})`, 'gi'),
                '<mark class="search-text-highlight">$1</mark>'
            );
            node.parentNode.replaceChild(span, node);
            
            setTimeout(() => {
                if (span.parentNode) {
                    span.parentNode.replaceChild(
                        document.createTextNode(span.textContent),
                        span
                    );
                }
            }, 4000);
        });
    }

    processStoredSearch() {
        const searchData = sessionStorage.getItem('searchData');
        if (searchData) {
            const { anchor, query, timestamp } = JSON.parse(searchData);
            
            if (Date.now() - timestamp < 300000) {
                sessionStorage.removeItem('searchData');
                
                setTimeout(() => {
                    this.highlightAndScrollToElement(anchor, query);
                }, 800);
            } else {
                sessionStorage.removeItem('searchData');
            }
        }
    }

    highlightText(text, query) {
        if (!query) return this.escapeHtml(text);
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    getPageName(url) {
        const pageNames = {
            'index.html': '🏠 Inici',
            'events.html': '📅 Esdeveniments',
            'news.html': '📰 Notícies'
        };
        return pageNames[url] || url;
    }
}

// Inicialitzar el sistema de cerca
window.searchSystem = new SearchSystem();

// Inicialització retardada
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.searchSystem && typeof window.searchSystem.init === 'function') {
            window.searchSystem.init();
        }
    }, 1500);
});

// Animacions de comptadors
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count')); 
                if (!isNaN(target)) {
                    animateCounter(counter, target, speed);
                }
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
    
    function animateCounter(counter, target, duration) {
        let start = 0;
        const increment = target / (duration / 16); 
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                counter.textContent = Math.floor(start).toLocaleString('ca-ES'); 
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString('ca-ES');
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
}

// Funció que carrega les dades
async function initData() {
    try {
        const dades = {
            euros: 2,
            voluntaris: 23,
            esdeveniments: 0,
            dataLimit: '2025-12-15'
        };

        const eurosElement = document.getElementById('euros');
        const voluntarisElement = document.getElementById('voluntaris');
        const esdevenimentsElement = document.getElementById('esdeveniments');
        
        if (eurosElement) eurosElement.setAttribute('data-count', dades.euros);
        if (voluntarisElement) voluntarisElement.setAttribute('data-count', dades.voluntaris);
        if (esdevenimentsElement) esdevenimentsElement.setAttribute('data-count', dades.esdeveniments);
        
        const diesRestants = calcularDiesRestants(dades.dataLimit);
        const diesRestantsElement = document.getElementById('dies-restants');
        if (diesRestantsElement) diesRestantsElement.textContent = diesRestants;

    } catch (error) {
        console.error('Error carregant les dades:', error);
    }
}

function calcularDiesRestants(dataLimit) {
    const dataActual = new Date();
    const dataFinal = new Date(dataLimit);
    
    const diferènciaMs = dataFinal - dataActual;
    const diesRestants = Math.ceil(diferènciaMs / (1000 * 60 * 60 * 24));
    
    return diesRestants > 0 ? diesRestants : 0;
}

// Animacions de scroll
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.stat-card, .event-card, .news-card, .feature-item, .section-header, .about-content, .visual-card');
    
    animatedElements.forEach(el => {
        el.classList.add('scroll-animate');
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
}

// Gestió de formularis
function initForms() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name')?.value;
            const email = document.getElementById('email')?.value;
            const subject = document.getElementById('subject')?.value;
            const message = document.getElementById('message')?.value;
            
            if (!name || !email || !subject || !message) {
                showNotification('Si us plau, omple tots els camps', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Si us plau, introdueix un email vàlid', 'error');
                return;
            }
            
            showNotification('Missatge enviat correctament. Et respondrem aviat!', 'success');
            contactForm.reset();
        });
    }
}

// Comptador per a esdeveniments
function initCountdown() {
    const countdownDate = new Date('2026-01-31T23:59:59').getTime(); 
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const countdownContainer = document.getElementById('countdown');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl || !countdownContainer) {
        return;
    }
    
    function updateCountdown() {
        const now = new Date().getTime();
        let distance = countdownDate - now;
        
        if (distance < 0) {
            countdownContainer.innerHTML = "<div class='countdown-finished'>L'esdeveniment ha començat!</div>";
            clearInterval(countdownInterval);
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        distance %= (1000 * 60 * 60 * 24);
        const hours = Math.floor(distance / (1000 * 60 * 60));
        distance %= (1000 * 60 * 60);
        const minutes = Math.floor(distance / (1000 * 60));
        distance %= (1000 * 60);
        const seconds = Math.floor(distance / 1000);

        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown(); 
    const countdownInterval = setInterval(updateCountdown, 1000); 
}

// Filtres per a notícies i esdeveniments
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const items = document.querySelectorAll('.news-card-full, .event-card-full');
            items.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category')?.includes(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Funcions auxiliars
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    let style = document.querySelector('.notification-styles');
    if (!style) {
        style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 10000;
                min-width: 300px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease-out;
            }
            .notification-success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .notification-error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: 10px;
                color: inherit;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', function() {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Event listeners addicionals
function initEventListeners() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; 
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    const yearElement = document.querySelector('.footer-bottom p:first-child');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = `© ${currentYear} Cooperativa Marató TV3. Tots els drets reservats.`;
    }
}