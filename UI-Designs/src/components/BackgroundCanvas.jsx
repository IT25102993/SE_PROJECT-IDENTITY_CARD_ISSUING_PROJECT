import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export const BackgroundCanvas = () => {
  const canvasRef = useRef(null);
  const { theme } = useApp();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle system
    const PARTICLE_COUNT = 25;
    const particles = [];

    class Particle {
      constructor() {
        this.init(true);
      }

      init(onScreen = false) {
        this.x = Math.random() * width;
        this.y = onScreen ? Math.random() * height : height + 60;
        this.size = Math.random() * 10 + 4;
        this.speedY = Math.random() * 0.25 + 0.08;
        this.speedX = (Math.random() - 0.5) * 0.08;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.008;
        this.opacity = Math.random() * 0.18 + 0.05;
        this.type = Math.floor(Math.random() * 3);
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220 && dist > 0) {
          this.x += dx * 0.002;
          this.y += dy * 0.002;
        }

        if (this.y < -50) this.init(false);
      }

      draw() {
        const isLight = theme === 'light';
        const color = isLight
          ? `rgba(59, 130, 246, ${this.opacity * 0.8})`
          : `rgba(96, 165, 250, ${this.opacity})`;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (this.type === 0) {
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size, this.size);
          ctx.lineTo(-this.size, this.size);
          ctx.closePath();
        } else if (this.type === 1) {
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size * 0.65, 0);
          ctx.lineTo(0, this.size);
          ctx.lineTo(-this.size * 0.65, 0);
          ctx.closePath();
        } else {
          ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const drawGrid = () => {
      const spacing = 45;
      const dotColor = theme === 'light'
        ? 'rgba(0, 0, 0, 0.05)'
        : 'rgba(255, 255, 255, 0.04)';

      ctx.fillStyle = dotColor;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};
