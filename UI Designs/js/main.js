document.addEventListener('DOMContentLoaded', () => {
    
    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('visible');
                    
                    const staggerItems = entry.target.querySelectorAll('.reveal-item');
                    if (staggerItems.length > 0) {
                        staggerItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('visible');
                            }, index * 100);
                        });
                    }

                    const subReveals = entry.target.querySelectorAll('.reveal-left, .reveal-right');
                    subReveals.forEach(el => el.classList.add('visible'));
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Optimized Parallax & Dynamic Nav with requestAnimationFrame
    let scrollPos = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        scrollPos = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translate3d(0, ${scrollPos * 0.3}px, 0)`;
                    heroContent.style.opacity = 1 - (scrollPos / 600);
                }
                
                const nav = document.querySelector('nav');
                if (nav) {
                    if (scrollPos > 50) {
                        nav.style.padding = '10px 0';
                        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                    } else {
                        nav.style.padding = '0';
                        nav.style.boxShadow = 'none';
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Form Submission Handling (Mailto Integration)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const subjectSelect = document.getElementById('subject');
            const subject = subjectSelect ? subjectSelect.value : 'Project Inquiry';

            const mailtoLink = `mailto:leonardo.graphics.and.artworks@gmail.com?subject=${encodeURIComponent(subject + ' - ' + name)}&body=${encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message)}`;
            
            console.log("Generated Mailto Link:", mailtoLink);
            
            // Visual Feedback
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Opening Mail...';
            submitBtn.disabled = true;

            setTimeout(() => {
                window.location.href = mailtoLink;
                
                submitBtn.textContent = 'Inquiry Sent!';
                submitBtn.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.disabled = false;
                }, 3000);
            }, 500);
        });
    }

    // Optimized Custom Cursor
    if (window.innerWidth > 1024) {
        document.body.classList.add('custom-cursor-active');
        
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        document.body.appendChild(cursorDot);

        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let cursorX = mouseX, cursorY = mouseY;
        let dotX = mouseX, dotY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            // Smooth easing for large cursor
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            
            // Faster easing for dot
            dotX += (mouseX - dotX) * 0.35;
            dotY += (mouseY - dotY) * 0.35;
            
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
            
            requestAnimationFrame(animateCursor);
        }
        requestAnimationFrame(animateCursor);

        document.querySelectorAll('a, button, .portfolio-item, .cta-button').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

    // Mobile Menu Logic
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('is-active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // Back to Top Logic
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Theme Switcher Logic
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (themeIcon) {
                themeIcon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
        });
    }

    // Antigravity Particle System
    const canvas = document.getElementById('antigravity-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const particleCount = 40; // More sparse and elegant
        let w, h;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.init(true);
            }

            init(onScreen = false) {
                this.x = Math.random() * w;
                this.y = onScreen ? Math.random() * h : h + 100;
                this.size = Math.random() * 15 + 5;
                this.speedY = Math.random() * 0.3 + 0.1;
                this.speedX = (Math.random() - 0.5) * 0.1;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.01;
                this.opacity = Math.random() * 0.3 + 0.05;
                this.type = Math.floor(Math.random() * 3);
                this.blur = Math.random() > 0.8 ? 3 : 0; // Distant blurred shapes
                this.color = '#f9e2af';
            }

            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                this.rotation += this.rotationSpeed;

                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 300) {
                    this.x += dx * 0.005;
                    this.y += dy * 0.005;
                }

                if (this.y < -50) {
                    this.init(false);
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.globalAlpha = this.opacity;
                if (this.blur) ctx.filter = `blur(${this.blur}px)`;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;

                ctx.beginPath();
                if (this.type === 0) {
                    ctx.moveTo(0, -this.size);
                    ctx.lineTo(this.size, this.size);
                    ctx.lineTo(-this.size, this.size);
                    ctx.closePath();
                } else if (this.type === 1) {
                    ctx.moveTo(0, -this.size);
                    ctx.lineTo(this.size * 0.7, 0);
                    ctx.lineTo(0, this.size);
                    ctx.lineTo(-this.size * 0.7, 0);
                    ctx.closePath();
                } else {
                    ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
                }
                ctx.stroke();
                
                ctx.globalAlpha = this.opacity * 0.2;
                ctx.fillStyle = this.color;
                ctx.fill();
                
                ctx.restore();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            const p = new Particle();
            particles.push(p);
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }
});
