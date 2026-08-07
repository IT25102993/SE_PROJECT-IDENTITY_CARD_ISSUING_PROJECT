document.addEventListener('DOMContentLoaded', () => {

    // ─── Global state ───────────────────────────────────────────
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ─── Intersection Observer — Scroll Reveal ───────────────────
    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('visible');

                    // Stagger child .reveal-item elements
                    const staggerItems = entry.target.querySelectorAll('.reveal-item');
                    staggerItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 120);
                    });

                    // Trigger side-reveal elements
                    entry.target.querySelectorAll('.reveal-left, .reveal-right')
                        .forEach(el => el.classList.add('visible'));
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // ─── Nav scroll state ────────────────────────────────────────
    const nav = document.getElementById('main-nav');
    let scrollPos = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        scrollPos = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Nav scroll shadow
                if (nav) {
                    nav.classList.toggle('scrolled', scrollPos > 50);
                }

                // Hero parallax (subtle)
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) {
                    const opacity = Math.max(0, 1 - scrollPos / 700);
                    heroContent.style.opacity = opacity;
                    heroContent.style.transform = `translateY(${scrollPos * 0.15}px)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    });

    // ─── Mobile Menu ─────────────────────────────────────────────
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('is-active');
                document.body.style.overflow = '';
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('is-active');
                document.body.style.overflow = '';
            }
        });
    }

    // ─── Back to Top ─────────────────────────────────────────────
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('show', window.scrollY > 300);
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── Theme Switcher ──────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    const applyTheme = (isLight) => {
        body.classList.toggle('light-theme', isLight);
        if (themeIcon) {
            themeIcon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
    };

    // Restore saved theme
    const savedTheme = localStorage.getItem('nexusgov-theme');
    if (savedTheme) applyTheme(savedTheme === 'light');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = body.classList.toggle('light-theme');
            localStorage.setItem('nexusgov-theme', isLight ? 'light' : 'dark');
            if (themeIcon) {
                themeIcon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
            }
        });
    }

    // ─── Contact Form (mailto) ────────────────────────────────────
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameVal    = document.getElementById('name')?.value.trim() || '';
            const emailVal   = document.getElementById('email')?.value.trim() || '';
            const messageVal = document.getElementById('message')?.value.trim() || '';
            const subjectEl  = document.getElementById('subject');
            const subjectVal = subjectEl ? subjectEl.value : 'General Inquiry';

            if (!nameVal || !emailVal || !messageVal) {
                alert('Please fill in all required fields.');
                return;
            }

            const mailtoLink = `mailto:support@nexusgov.lk?subject=${encodeURIComponent(subjectVal + ' – ' + nameVal)}&body=${encodeURIComponent(
                'Name: ' + nameVal + '\nEmail: ' + emailVal + '\n\nMessage:\n' + messageVal
            )}`;

            const submitBtn = document.getElementById('submit-btn');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                window.location.href = mailtoLink;

                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
                submitBtn.style.background = '#22c55e';

                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    contactForm.reset();
                }, 3000);
            }, 500);
        });
    }

    // ─── Sketch Grid Canvas Background ───────────────────────────
    const canvas = document.getElementById('sketch-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h;

    // Resize canvas
    const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Determine if light mode
    const isLightMode = () => document.body.classList.contains('light-theme');

    // Grid dots
    function drawGrid() {
        const spacing = 40;
        const dotRadius = 1;
        const dotColor = isLightMode()
            ? 'rgba(0, 0, 0, 0.06)'
            : 'rgba(255, 255, 255, 0.04)';

        ctx.fillStyle = dotColor;
        for (let x = 0; x < w; x += spacing) {
            for (let y = 0; y < h; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Floating sketch particles
    const PARTICLE_COUNT = 25;
    const particles = []; // FIX: declare the array

    class Particle {
        constructor() {
            this.init(true);
        }

        init(onScreen = false) {
            this.x = Math.random() * w;
            this.y = onScreen ? Math.random() * h : h + 80;
            this.size = Math.random() * 12 + 4;
            this.speedY = Math.random() * 0.25 + 0.08;
            this.speedX = (Math.random() - 0.5) * 0.08;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.008;
            this.opacity = Math.random() * 0.18 + 0.04;
            this.type = Math.floor(Math.random() * 3); // 0=triangle, 1=diamond, 2=circle
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotSpeed;

            // Subtle mouse attraction (uses global mouseX/mouseY)
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250 && dist > 0) {
                this.x += dx * 0.003;
                this.y += dy * 0.003;
            }

            if (this.y < -60) this.init(false);
        }

        draw() {
            const color = isLightMode()
                ? `rgba(79, 110, 247, ${this.opacity})`
                : `rgba(120, 150, 255, ${this.opacity})`;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;

            ctx.beginPath();
            if (this.type === 0) {
                // Triangle
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size, this.size);
                ctx.lineTo(-this.size, this.size);
                ctx.closePath();
            } else if (this.type === 1) {
                // Diamond
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size * 0.65, 0);
                ctx.lineTo(0, this.size);
                ctx.lineTo(-this.size * 0.65, 0);
                ctx.closePath();
            } else {
                // Circle
                ctx.arc(0, 0, this.size * 0.75, 0, Math.PI * 2);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    // Populate particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
        ctx.clearRect(0, 0, w, h);
        drawGrid();
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };

    animate();

});
