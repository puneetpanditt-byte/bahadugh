// Main JavaScript for Bahadurgarh News Website

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupCurrentDate();
    setupNavigation();
    setupBreakingNewsTicker();
    setupNewsletterForm();
    setupSearchFunctionality();
    setupScrollEffects();
    setupImageLazyLoading();
    setupVideoPlayer();
    setupSocialShare();
    setupAccessibility();
}

// Set Current Date
function setupCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const currentDate = new Date().toLocaleDateString('en-US', options);
        dateElement.textContent = currentDate;
    }
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        // Remove active class from all links
        link.classList.remove('active');
        
        // Add active class to current page
        if (link.getAttribute('href') === currentPath || 
            (currentPath === '/' && link.textContent === 'Home')) {
            link.classList.add('active');
        }
        
        // Smooth scroll for anchor links
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Breaking News Ticker
function setupBreakingNewsTicker() {
    const ticker = document.querySelector('.animate-ticker');
    if (ticker) {
        // Clone the ticker content for seamless scrolling
        const tickerContent = ticker.innerHTML;
        ticker.innerHTML = tickerContent + tickerContent;
        
        // Add hover pause functionality
        const tickerContainer = ticker.parentElement;
        tickerContainer.addEventListener('mouseenter', () => {
            ticker.style.animationPlayState = 'paused';
        });
        
        tickerContainer.addEventListener('mouseleave', () => {
            ticker.style.animationPlayState = 'running';
        });
    }
}

// Newsletter Form
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Subscribing...';
            submitButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                showNotification('Successfully subscribed to newsletter!', 'success');
                emailInput.value = '';
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        });
    }
}

// Email Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Search Functionality
function setupSearchFunctionality() {
    const searchInput = document.querySelector('input[placeholder="Search news..."]');
    const searchResults = document.createElement('div');
    searchResults.className = 'absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 hidden z-50 max-h-96 overflow-y-auto';
    
    if (searchInput) {
        searchInput.parentElement.appendChild(searchResults);
        
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }
            
            searchTimeout = setTimeout(() => {
                performSearch(query, searchResults);
            }, 300);
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }
}

// Perform Search
async function performSearch(query, resultsContainer) {
    try {
        // Simulate API call
        const mockResults = [
            { title: 'Breaking: Major Policy Announcement', category: 'India', url: '/article/1' },
            { title: 'Stock Market Reaches New Heights', category: 'Business', url: '/article/2' },
            { title: 'Sports: India Wins Championship', category: 'Sports', url: '/article/3' },
            { title: 'Technology: AI Innovation Center', category: 'Technology', url: '/article/4' }
        ].filter(article => article.title.toLowerCase().includes(query.toLowerCase()));
        
        if (mockResults.length === 0) {
            resultsContainer.innerHTML = '<div class="p-4 text-gray-500">No results found</div>';
        } else {
            resultsContainer.innerHTML = mockResults.map(article => `
                <a href="${article.url}" class="block p-3 hover:bg-gray-100 transition-colors border-b">
                    <div class="font-medium text-gray-800">${article.title}</div>
                    <div class="text-sm text-gray-500">${article.category}</div>
                </a>
            `).join('');
        }
        
        resultsContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Scroll Effects
function setupScrollEffects() {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', throttle(function() {
        const currentScrollY = window.scrollY;
        
        // Add shadow to navigation on scroll
        if (currentScrollY > 10) {
            nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
        
        // Hide/show header on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    }, 100));
    
    // Add transition for header
    header.style.transition = 'transform 0.3s ease';
}

// Image Lazy Loading
function setupImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Video Player Setup
function setupVideoPlayer() {
    const videoPlayButtons = document.querySelectorAll('.fa-play-circle');
    
    videoPlayButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoCard = this.closest('.news-card');
            const videoTitle = videoCard.querySelector('h4').textContent;
            
            // Create modal for video playback
            const modal = createVideoModal(videoTitle);
            document.body.appendChild(modal);
            
            // Show modal
            setTimeout(() => {
                modal.classList.add('show');
            }, 100);
        });
    });
}

// Create Video Modal
function createVideoModal(title) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-4xl w-full mx-4">
            <div class="flex justify-between items-center p-4 border-b">
                <h3 class="text-lg font-semibold">${title}</h3>
                <button class="close-modal text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div class="aspect-w-16 aspect-h-9 bg-black">
                <div class="flex items-center justify-center h-96">
                    <div class="text-white text-center">
                        <i class="fas fa-play-circle text-6xl mb-4"></i>
                        <p>Video player would be embedded here</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Close modal functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
    
    return modal;
}

// Social Share Functionality
function setupSocialShare() {
    // Add share buttons to articles
    const shareButtons = document.createElement('div');
    shareButtons.className = 'fixed bottom-4 right-4 z-40 flex flex-col space-y-2';
    shareButtons.innerHTML = `
        <button class="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors" onclick="shareOnFacebook()">
            <i class="fab fa-facebook-f"></i>
        </button>
        <button class="bg-sky-500 text-white p-3 rounded-full shadow-lg hover:bg-sky-600 transition-colors" onclick="shareOnTwitter()">
            <i class="fab fa-twitter"></i>
        </button>
        <button class="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors" onclick="shareOnWhatsApp()">
            <i class="fab fa-whatsapp"></i>
        </button>
    `;
    
    document.body.appendChild(shareButtons);
}

// Share Functions
function shareOnFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnTwitter() {
    const url = window.location.href;
    const title = document.title;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
}

function shareOnWhatsApp() {
    const url = window.location.href;
    const title = document.title;
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
}

// Accessibility Features
function setupAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-600 text-white px-4 py-2 rounded z-50';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add ARIA labels
    const main = document.querySelector('main');
    if (main) {
        main.id = 'main-content';
        main.setAttribute('role', 'main');
    }
    
    const nav = document.querySelector('nav');
    if (nav) {
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Main navigation');
    }
    
    // Keyboard navigation for news cards
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
    });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const nav = document.querySelector('nav');
    const mobileMenu = nav.querySelector('.flex.space-x-1');
    
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('absolute', 'top-full', 'left-0', 'right-0', 'bg-red-600', 'flex-col', 'p-4');
    } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('absolute', 'top-full', 'left-0', 'right-0', 'bg-red-600', 'flex-col', 'p-4');
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-600 text-white' :
        type === 'error' ? 'bg-red-600 text-white' :
        'bg-blue-600 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Utility Functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
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

// Performance Monitoring
function logPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        });
    }
}

// Initialize performance monitoring
logPerformance();

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showNotification('Something went wrong. Please try again.', 'error');
});

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}
