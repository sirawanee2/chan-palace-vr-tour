/* ============================================
   CHAN PALACE VIRTUAL TOUR - MAIN JS
   ============================================ */

class ChanPalaceApp {
    constructor() {
        this.currentLang = 'th';
        this.content = null;
        this.init();
    }

    async init() {
        this.setupLoading();
        await this.loadContent();
        this.setupParticles();
        this.setupHeroSlideshow();
        this.setupNavigation();
        this.setupLanguageSwitch();
        this.renderLocations();
        this.setupScrollAnimations();
        this.hideLoading();
    }

    setupLoading() {
        const loading = document.querySelector('.loading-screen');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    hideLoading() {
        const loading = document.querySelector('.loading-screen');
        if (loading) {
            setTimeout(() => {
                loading.classList.add('hidden');
            }, 1500);
        }
    }

    async loadContent() {
        try {
            const response = await fetch('assets/data/content.json?v=' + Date.now(), { cache: 'no-store' });
            this.content = await response.json();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    setupParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.gold = Math.random() > 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                if (this.gold) {
                    ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
                } else {
                    ctx.fillStyle = `rgba(139, 0, 0, ${this.opacity * 0.5})`;
                }
                ctx.fill();
            }
        }

        // Create particles
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }

        // Draw connections
        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawConnections();
            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup on page hide
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });
    }

    // Cross-fade the hero background through the given images, one every 5 seconds
    setupHeroSlideshow() {
        const images = [
            'img/113.jpg',
            'img/114.jpg',
            'img/115.jpg'
        ];

        const layerA = document.getElementById('heroBgA');
        const layerB = document.getElementById('heroBgB');
        if (!layerA || !layerB || images.length === 0) return;

        let index = 0;
        let showingA = true;

        // Show the first image immediately
        layerA.style.backgroundImage = `url('${images[0]}')`;
        layerA.classList.add('active');

        if (images.length === 1) return;

        setInterval(() => {
            index = (index + 1) % images.length;
            const nextLayer = showingA ? layerB : layerA;
            const currentLayer = showingA ? layerA : layerB;

            nextLayer.style.backgroundImage = `url('${images[index]}')`;
            nextLayer.classList.add('active');
            currentLayer.classList.remove('active');

            showingA = !showingA;
        }, 5000);
    }

    setupNavigation() {
        const nav = document.querySelector('.main-nav');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    setupLanguageSwitch() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchLanguage(lang);

                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        const data = this.content[lang];
        if (!data) return;

        // Update UI texts
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (data.ui[key]) {
                el.textContent = data.ui[key];
            }
        });

        // Update hero
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroCta = document.querySelector('.hero-cta span');

        if (heroTitle) heroTitle.textContent = data.ui.welcome;
        if (heroSubtitle) heroSubtitle.textContent = data.ui.description;
        if (heroCta) heroCta.textContent = data.ui.start_tour;

        // Update section titles
        const sectionTitle = document.querySelector('.locations-section .section-title');
        const sectionDesc = document.querySelector('.locations-section .section-desc');

        if (sectionTitle) sectionTitle.textContent = data.ui.select_location;
        if (sectionDesc) sectionDesc.textContent = data.ui.description;

        // Re-render locations
        this.renderLocations();
    }

    renderLocations() {
        const grid = document.querySelector('.locations-grid');
        if (!grid || !this.content) return;

        const data = this.content[this.currentLang];
        const locations = data.locations;

        grid.innerHTML = locations.map((loc, index) => `
            <article class="location-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="card-image">
                    <img src="${loc.thumbnail}" alt="${loc.name}" loading="lazy">
                    <div class="card-image-overlay"></div>
                    <span class="card-badge">360° VR</span>
                </div>
                <div class="card-content">
                    <span class="card-number">0${index + 1}</span>
                    <h3 class="card-title">${loc.name.replace(/\n/g, '<br>')}</h3>
                    <p class="card-text">${loc.summary || loc.overview.text}</p>
                    <div class="card-meta">
                        <span class="meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            ${loc.overview.duration}
                        </span>
                        <span class="meta-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                            </svg>
                            AI Voice
                        </span>
                    </div>
                    <a href="tour.html?id=${loc.id}&lang=${this.currentLang}" class="card-btn">
                        <span>${data.ui.start_tour}</span>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                    </a>
                </div>
            </article>
        `).join('');

        // Re-init scroll animations for new elements
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.location-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChanPalaceApp();
});