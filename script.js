// Cooperativa Marató TV3 - Script Principal
document.addEventListener('DOMContentLoaded', function() {
    // Inicialitzar totes les funcionalitats
    initNavbar();
    initSearch();
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

function iniciarTicker() {
            const div = document.querySelector('#emails');
            const paragrafs = div.querySelectorAll('p');
            let indexActual = 0;

            // Amaga tots els paràgrafs inicialment afegint una classe
            paragrafs.forEach(p => p.classList.add('amagat'));

            // Mostra el primer element
            paragrafs[indexActual].classList.remove('amagat');
            paragrafs[indexActual].classList.add('visible');

            setInterval(() => {
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
        });
    }
    
    // Tancar menú en fer clic en un enllaç
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    
    // Canviar navbar en scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) { // Afegit check per evitar errors si no hi ha navbar
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }
        }
    });
}

// Sistema de cerca
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    // Dades de cerca (simulades)
    const searchData = [
        { title: 'Sobre Nosaltres', content: 'Informació sobre la nostra cooperativa i la nostra missió', url: 'index.html#sobre-nosaltres' },
        { title: 'Esdeveniments', content: 'Pròxims esdeveniments solidaris de la cooperativa', url: 'events.html' },
        { title: 'Notícies', content: 'Últimes notícies i actualitzacions de la cooperativa', url: 'news.html' },
        { title: 'Contacte', content: 'Com posar-te en contacte amb la nostra cooperativa', url: 'index.html#contacte' },
        { title: 'Cursa Solidària', content: 'Participa en la propera cursa solidària de 10km', url: 'events.html' },
        { title: 'Voluntariat', content: 'Com formar part del nostre equip de voluntaris', url: 'index.html#contacte' },
        { title: 'Marató TV3', content: 'Informació sobre la Marató de TV3 i la seva importància', url: 'index.html' }
    ];
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        const results = searchData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.content.toLowerCase().includes(query)
        );
        
        displaySearchResults(results, query);
    });
    
    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No s\'han trobat resultats</div>';
            searchResults.style.display = 'block';
            return;
        }
        
        searchResults.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="window.location.href='${item.url}'">
                <div class="search-result-title">${highlightText(item.title, query)}</div>
                <div class="search-result-content">${highlightText(item.content, query)}</div>
            </div>
        `).join('');
        
        searchResults.style.display = 'block';
    }
    
    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Amagar resultats en fer clic fora
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Animacions de comptadors
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // Durada de l'animació en mil·lisegons
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                // Assegurar que el data-count és un nombre
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
        // El càlcul de l'increment ha de tenir en compte la durada per frame (aprox 16ms)
        const increment = target / (duration / 16); 
        
        // Funció per a l'animació utilitzant requestAnimationFrame per a un rendiment més suau
        function updateCounter() {
            start += increment;
            if (start < target) {
                // Afegit toLocaleString per formatar els nombres grans amb separadors de milers
                counter.textContent = Math.floor(start).toLocaleString('ca-ES'); 
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString('ca-ES');
            }
        }
        
        requestAnimationFrame(updateCounter); // Utilitzar requestAnimationFrame per al primer frame
    }
}

// Funció que carrega les dades (abans 'carregarDades')
async function initData() {
    try {
        // En un entorn real, aquesta URL seria la ruta al teu fitxer data.json
        // Per aquest exemple, fem servir dades simulades
        // const resposta = await fetch('data.json');
        // const dades = await resposta.json();

        // Dades simulades per evitar errors si data.json no existeix
        const dades = {
            euros: 2,
            voluntaris: 23,
            esdeveniments: 0,
            dataLimit: '2025-12-15' // Data de límit diferent per a provar
        };

        // Actualitzem les estadístiques, utilitzant data-count per a initCounters()
        const eurosElement = document.getElementById('euros');
        const voluntarisElement = document.getElementById('voluntaris');
        const esdevenimentsElement = document.getElementById('esdeveniments');
        
        if (eurosElement) eurosElement.setAttribute('data-count', dades.euros);
        if (voluntarisElement) voluntarisElement.setAttribute('data-count', dades.voluntaris);
        if (esdevenimentsElement) esdevenimentsElement.setAttribute('data-count', dades.esdeveniments);
        
        // El codi initCounters() ja s'encarrega d'animar els comptadors
        
        // Calculem i mostrem els dies restants (si cal)
        const diesRestants = calcularDiesRestants(dades.dataLimit);
        const diesRestantsElement = document.getElementById('dies-restants');
        if (diesRestantsElement) diesRestantsElement.textContent = diesRestants;
        
        // Mostrem la data límit formatejada (si cal)
        const dataLimit = new Date(dades.dataLimit);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const dataLimitElement = document.getElementById('data-limit');
        if (dataLimitElement) dataLimitElement.textContent = dataLimit.toLocaleDateString('ca-ES', options);

    } catch (error) {
        console.error('Error carregant les dades:', error);
        // En cas d'error, carreguem dades per defecte
        // Nota: initCounters() es crida abans, caldria reajustar si es vol animar dades per defecte
    }
}

// Funció per calcular els dies restants fins a una data
function calcularDiesRestants(dataLimit) {
    const dataActual = new Date();
    const dataFinal = new Date(dataLimit);
    
    // Calculem la diferència en mil·lisegons
    const diferènciaMs = dataFinal - dataActual;
    
    // Convertim a dies (1 dia = 24 hores * 60 minuts * 60 segons * 1000 ms)
    const diesRestants = Math.ceil(diferènciaMs / (1000 * 60 * 60 * 24));
    
    // Si la data ja ha passat, retornem 0
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
                // Opcional: Desconnectar l'observador un cop s'ha animat
                // observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
}

// Gestió de formularis
function initForms() {
    // Formulari de contacte
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validació bàsica
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
            
            // Simular enviament
            showNotification('Missatge enviat correctament. Et respondrem aviat!', 'success');
            contactForm.reset();
        });
    }
}

// Comptador per a esdeveniments
function initCountdown() {
    // Data de l'esdeveniment (Marató TV3 per defecte)
    const countdownDate = new Date('2026-01-31T23:59:59').getTime(); 
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const countdownContainer = document.getElementById('countdown');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl || !countdownContainer) {
        console.error('Un o més elements del compte enrere no es troben al DOM.');
        return;
    }
    
    function updateCountdown() {
        const now = new Date().getTime();
        let distance = countdownDate - now;
        
        if (distance < 0) {
            // S'ha acabat el temps
            countdownContainer.innerHTML = "<div class='countdown-finished'>L'esdeveniment ha començat!</div>";
            clearInterval(countdownInterval); // Aturar l'interval
            return;
        }
        
        // Càlculs de temps (utilitzem 'let' ja que 'distance' canvia)
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        distance %= (1000 * 60 * 60 * 24);
        const hours = Math.floor(distance / (1000 * 60 * 60));
        distance %= (1000 * 60 * 60);
        const minutes = Math.floor(distance / (1000 * 60));
        distance %= (1000 * 60);
        const seconds = Math.floor(distance / 1000);

        // Actualització dels elements del DOM amb dos dígits
        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Crida inicial per evitar el 'flicker'
    updateCountdown(); 
    // Crida periòdica cada segon
    const countdownInterval = setInterval(updateCountdown, 1000); 
}

// Filtres per a notícies i esdeveniments
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Actualitzar botons actius
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar elements
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
    // Crear element de notificació
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Estils per a les notificacions (s'assumeix que són al CSS)
    // Per a la funció autònoma, si no hi ha CSS extern
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
                color: inherit; /* Hereda el color del text */
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
    
    // Tancar notificació
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto-tancar després de 5 segons
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Event listeners addicionals
function initEventListeners() {
    // Smooth scroll per enllaços interns
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // S'assumeix que la navbar té una altura de 80px
                const offsetTop = targetElement.offsetTop - 80; 
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Actualitzar any al footer
    const yearElement = document.querySelector('.footer-bottom p:first-child');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = `© ${currentYear} Cooperativa Marató TV3. Tots els drets reservats.`;
    }
}
