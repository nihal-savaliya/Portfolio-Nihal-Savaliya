/* ============================================
   JAVASCRIPT - Portfolio Interactivity  
   ============================================ */

(function () {
    'use strict';

    /* -----------------------------------------
       PARTICLE BACKGROUND
    ----------------------------------------- */
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let animationFrame;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction — subtle push
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x -= dx * force * 0.01;
                this.y -= dy * force * 0.01;
            }

            // Wrap around edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            const style = getComputedStyle(document.documentElement);
            const rgb = style.getPropertyValue('--particle-color').trim();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb}, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 100);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        const style = getComputedStyle(document.documentElement);
        const rgb = style.getPropertyValue('--particle-color').trim();
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${rgb}, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        animationFrame = requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    /* -----------------------------------------
       CUSTOM CURSOR
    ----------------------------------------- */
    const cursorGlow = document.getElementById('cursorGlow');
    const cursorDot = document.getElementById('cursorDot');
    let cursorX = 0, cursorY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
    });

    function animateCursor() {
        glowX += (cursorX - glowX) * 0.15;
        glowY += (cursorY - glowY) * 0.15;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const interactives = document.querySelectorAll('a, button, .skill-card, .project-card, .contact-card');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => cursorGlow.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorGlow.classList.remove('hover'));
    });

    /* -----------------------------------------
       THEME TOGGLE
    ----------------------------------------- */
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Load saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    /* -----------------------------------------
       TYPING EFFECT
    ----------------------------------------- */
    const typingEl = document.getElementById('typingText');
    const phrases = [
        'CSE-IoT Student',
        'Web Developer',
        'C/C++ Programmer',
        'Tech Enthusiast',
        'Problem Solver'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const current = phrases[phraseIndex];
        if (!isDeleting) {
            typingEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === current.length) {
                isDeleting = true;
                setTimeout(typeEffect, 2000);
                return;
            }
        } else {
            typingEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }
        }
        setTimeout(typeEffect, isDeleting ? 40 : 80);
    }
    typeEffect();

    /* -----------------------------------------
       SCROLL ANIMATIONS (Intersection Observer)
    ----------------------------------------- */
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate skill bars
                const bars = entry.target.querySelectorAll('.skill-bar-fill');
                bars.forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width + '%';
                });

                // Animate stat counters
                const counters = entry.target.querySelectorAll('.stat-number');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-count'));
                    animateCounter(counter, target);
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    function animateCounter(el, target) {
        let current = 0;
        const increment = target / 40;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 40);
    }

    /* -----------------------------------------
       NAVBAR — scroll effect & active section
    ----------------------------------------- */
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('.hero, .section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Navbar shrink
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section highlighting
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });

        // Hide scroll indicator
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (scrollIndicator) {
            scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '1';
        }
    });

    /* -----------------------------------------
       MOBILE MENU
    ----------------------------------------- */
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinksContainer.classList.toggle('open');
    });

    // Close menu on link click
    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('open');
        });
    });

    /* -----------------------------------------
       TILT EFFECT on skill cards (desktop only)
    ----------------------------------------- */
    if (window.matchMedia('(min-width: 769px)').matches) {
        document.querySelectorAll('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

})();
