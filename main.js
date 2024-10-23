// Utility functions
const select = (selector) => document.querySelector(selector);
const selectAll = (selector) => document.querySelectorAll(selector);

// Smooth scrolling
const initSmoothScroll = () => {
    selectAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = select(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                const navLinks = select('.nav-links');
                const mobileMenu = select('.mobile-menu');
                if (navLinks?.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenu?.classList.remove('active');
                }
            }
        });
    });
};

// Navbar scroll behavior
const initNavbar = () => {
    const navbar = select('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar.style.background = 'rgba(30, 30, 30, 0.9)';
        } else {
            navbar.style.background = 'transparent';
        }
        lastScroll = currentScroll;
    });
};

// Mobile menu
const initMobileMenu = () => {
    const mobileMenu = select('.mobile-menu');
    const navLinks = select('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }
};

// Enhanced Work Carousel
class WorkCarousel {
    constructor() {
        // Initialize properties
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.autoplayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        // Select elements
        this.carousel = select('.work-carousel');
        this.cards = selectAll('.work-card');
        this.indicatorsContainer = select('.carousel-indicators');

        if (!this.carousel || !this.cards.length) return;

        // Initialize carousel
        this.init();
    }

    init() {
        // Create navigation buttons
        this.createNavButtons();
        // Create indicators
        this.createIndicators();
        // Set up event listeners
        this.setupEventListeners();
        // Start autoplay
        this.startAutoplay();
        // Preload images
        this.preloadImages();
    }

    createNavButtons() {
        // Create prev/next buttons if they don't exist
        if (!select('.carousel-nav.prev')) {
            const prevButton = document.createElement('button');
            prevButton.className = 'carousel-nav prev';
            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevButton.setAttribute('aria-label', 'Previous project');
            this.carousel.appendChild(prevButton);
        }

        if (!select('.carousel-nav.next')) {
            const nextButton = document.createElement('button');
            nextButton.className = 'carousel-nav next';
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextButton.setAttribute('aria-label', 'Next project');
            this.carousel.appendChild(nextButton);
        }

        this.prevBtn = select('.carousel-nav.prev');
        this.nextBtn = select('.carousel-nav.next');
    }

    createIndicators() {
        this.cards.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            this.indicatorsContainer.appendChild(indicator);
        });
    }

    setupEventListeners() {
        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isElementInViewport(this.carousel)) {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            }
        });

        // Indicators
        selectAll('.carousel-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Touch events
        this.carousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.pauseAutoplay();
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) this.nextSlide();
                else this.prevSlide();
            }

            this.startAutoplay();
        }, { passive: true });

        // Pause autoplay on hover
        this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.carousel.addEventListener('mouseleave', () => this.startAutoplay());

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;

        this.isTransitioning = true;

        // Update cards
        this.cards[this.currentIndex].classList.remove('active');
        this.cards[index].classList.add('active');

        // Update indicators
        const indicators = this.indicatorsContainer.children;
        indicators[this.currentIndex].classList.remove('active');
        indicators[index].classList.add('active');

        // Reset progress bar animation
        const progressBar = this.cards[index].querySelector('.progress-bar::after');
        if (progressBar) {
            progressBar.style.animation = 'none';
            progressBar.offsetHeight; // Trigger reflow
            progressBar.style.animation = null;
        }

        this.currentIndex = index;

        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }

    nextSlide() {
        if (this.isTransitioning) return;
        const nextIndex = (this.currentIndex + 1) % this.cards.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        if (this.isTransitioning) return;
        const prevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.goToSlide(prevIndex);
    }

    startAutoplay() {
        this.pauseAutoplay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), 5000);
    }

    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    preloadImages() {
        this.cards.forEach(card => {
            const img = card.querySelector('img');
            if (img && img.src) {
                const preloadImg = new Image();
                preloadImg.src = img.src;
            }
        });
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// Section fade-in animation
const initSectionAnimation = () => {
    const sections = selectAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        setTimeout(() => {
            section.style.transition = 'opacity 0.5s ease';
            section.style.opacity = '1';
        }, index * 200);
    });
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initNavbar();
    initMobileMenu();
    initSectionAnimation();
    
    // Initialize carousel
    const workCarousel = new WorkCarousel();
});

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    const workCards = selectAll('.work-card');
    if (document.hidden) {
        workCards.forEach(card => {
            const img = card.querySelector('img');
            if (img) img.loading = 'lazy';
        });
    }
});