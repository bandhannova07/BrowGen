// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Download functionality
const downloadBtn = document.getElementById('downloadBtn');
const apkFileName = 'browgen-browser-v1.0.0.apk';

downloadBtn.addEventListener('click', () => {
    // Show loading state
    const originalContent = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Preparing Download...</span>';
    downloadBtn.disabled = true;

    // Simulate download preparation (you can replace this with actual APK file logic)
    setTimeout(() => {
        // Create a download link for the APK file
        const link = document.createElement('a');
        
        // Check if APK file exists, if not create a placeholder
        fetch('./browgen-app.apk')
            .then(response => {
                if (response.ok) {
                    // APK file exists, proceed with download
                    link.href = './browgen-app.apk';
                } else {
                    // APK file doesn't exist, show message and create placeholder
                    showDownloadMessage();
                    return;
                }
            })
            .catch(() => {
                // APK file doesn't exist, show message and create placeholder
                showDownloadMessage();
                return;
            });

        link.download = apkFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset button state
        downloadBtn.innerHTML = originalContent;
        downloadBtn.disabled = false;

        // Show success message
        showSuccessMessage();
    }, 2000);
});

function showDownloadMessage() {
    // Create modal for APK not found
    const modal = createModal(
        'APK File Not Found',
        'The APK file is not available yet. Please add your browgen-app.apk file to the project directory, or contact us for the latest version.',
        'info'
    );
    document.body.appendChild(modal);
    
    // Reset button
    const originalContent = '<i class="fas fa-download"></i><span>Download APK</span>';
    downloadBtn.innerHTML = originalContent;
    downloadBtn.disabled = false;
}

function showSuccessMessage() {
    const modal = createModal(
        'Download Started!',
        'Your Browgen app download has started. Check your downloads folder and install the APK file to get started.',
        'success'
    );
    document.body.appendChild(modal);
}

function createModal(title, message, type) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-icon ${type}">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                </div>
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary modal-ok">OK</button>
            </div>
        </div>
    `;

    // Add modal styles
    const modalStyles = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            padding: 1.5rem 1.5rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-body {
            padding: 1.5rem;
            text-align: center;
        }
        
        .modal-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2rem;
        }
        
        .modal-icon.success {
            background: #dcfce7;
            color: #16a34a;
        }
        
        .modal-icon.info {
            background: #dbeafe;
            color: #2563eb;
        }
        
        .modal-body p {
            color: #6b7280;
            line-height: 1.6;
            margin: 0;
        }
        
        .modal-footer {
            padding: 0 1.5rem 1.5rem;
            display: flex;
            justify-content: center;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;

    // Add styles to head if not already added
    if (!document.querySelector('#modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);
    }

    // Close modal functionality
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-ok').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Add fadeOut animation
    const fadeOutKeyframes = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    if (!document.querySelector('#fadeout-styles')) {
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.id = 'fadeout-styles';
        fadeOutStyle.textContent = fadeOutKeyframes;
        document.head.appendChild(fadeOutStyle);
    }

    return modal;
}

// Contact form handling
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Simulate form submission (replace with actual form handling)
    setTimeout(() => {
        // Reset form
        contactForm.reset();
        
        // Reset button
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;

        // Show success message
        const modal = createModal(
            'Message Sent!',
            `Thank you ${name}! Your message has been sent successfully. We'll get back to you soon at ${email}.`,
            'success'
        );
        document.body.appendChild(modal);
    }, 2000);
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .team-card, .download-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-bg');
    const phoneElement = document.querySelector('.phone-mockup');
    
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    if (phoneElement) {
        phoneElement.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Add loading animation to page
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Statistics counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const text = statNumber.textContent;
            
            if (text.includes('K+')) {
                const number = parseInt(text.replace('K+', ''));
                animateCounter(statNumber, number);
                statNumber.textContent = number + 'K+';
            } else if (text.includes('★')) {
                const number = parseFloat(text.replace('★', ''));
                animateCounter(statNumber, number);
                statNumber.textContent = number + '★';
            } else if (text.includes('MB')) {
                const number = parseInt(text.replace('MB', ''));
                animateCounter(statNumber, number);
                statNumber.textContent = number + 'MB';
            }
            
            statsObserver.unobserve(entry.target);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => statsObserver.observe(stat));
});
