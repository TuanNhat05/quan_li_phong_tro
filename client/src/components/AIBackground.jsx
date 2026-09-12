import React, { useEffect, useRef } from 'react';

/**
 * AIBackground - Full-screen Canvas animation: particles connected by neural network lines
 * Inspired by AI/Neural Network visuals with Teal color scheme
 */
export default function AIBackground() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── Config ────────────────────────────────────────────────────────────────
    const CONFIG = {
      particleCount: 90,
      connectionDistance: 155,
      particleSpeed: 0.45,
      minRadius: 1.5,
      maxRadius: 4,
      bgColor: '#E8ECEF',
      colors: {
        particle: ['#0D9488', '#0F766E', '#14B8A6', '#0E8A80', '#1A9E94', '#0B7A72'],
        line: 'rgba(13, 148, 136, ',
        glow: '#0D9488',
      },
      pulseSpeed: 0.02,
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const rand = (min, max) => Math.random() * (max - min) + min;
    const randColor = () => CONFIG.colors.particle[Math.floor(Math.random() * CONFIG.colors.particle.length)];

    // ── Resize handler ────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Particle class ────────────────────────────────────────────────────────
    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = rand(0, canvas.width);
        this.y = initial ? rand(0, canvas.height) : -10;
        this.vx = rand(-CONFIG.particleSpeed, CONFIG.particleSpeed);
        this.vy = rand(-CONFIG.particleSpeed, CONFIG.particleSpeed);
        this.radius = rand(CONFIG.minRadius, CONFIG.maxRadius);
        this.color = randColor();
        this.alpha = rand(0.3, 0.9);
        this.pulse = rand(0, Math.PI * 2); // phase offset
        this.pulseDir = Math.random() > 0.5 ? 1 : -1;
        this.glowing = Math.random() > 0.75;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += CONFIG.pulseSpeed * this.pulseDir;

        const pulsedAlpha = this.alpha + Math.sin(this.pulse) * 0.15;
        this.currentAlpha = Math.max(0.1, Math.min(1, pulsedAlpha));

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.currentAlpha;

        // Optional glow
        if (this.glowing) {
          ctx.shadowBlur = 14;
          ctx.shadowColor = CONFIG.colors.glow;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // ── Init particles ────────────────────────────────────────────────────────
    particlesRef.current = Array.from({ length: CONFIG.particleCount }, () => new Particle());

    // ── Draw connections ──────────────────────────────────────────────────────
    const drawConnections = (particles) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.connectionDistance) {
            const opacity = (1 - dist / CONFIG.connectionDistance) * 0.45;
            ctx.beginPath();
            ctx.strokeStyle = CONFIG.colors.line + opacity + ')';
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();

            // Data pulse dot travelling along the line (random chance)
            if (Math.random() < 0.002) {
              const t = (Math.sin(Date.now() * 0.002 + i) + 1) / 2;
              const px = particles[i].x + (particles[j].x - particles[i].x) * t;
              const py = particles[i].y + (particles[j].y - particles[i].y) * t;
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fillStyle = '#2DD4BF';
              ctx.globalAlpha = 0.8;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
      }
    };

    // ── Animation loop ────────────────────────────────────────────────────────
    const animate = () => {
      // Vẽ nền xám nhẹ trước
      ctx.fillStyle = CONFIG.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      particles.forEach((p) => p.update());
      drawConnections(particles);
      particles.forEach((p) => p.draw());

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="ai-bg-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 1,
      }}
    />
  );
}
