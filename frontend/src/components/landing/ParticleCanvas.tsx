// ParticleCanvas.tsx
// Full-size canvas that renders a floating particle network animation.
// Designed for absolute positioning inside the hero section.

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  opacity: number;
}

const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 130;
const COLORS = ['#4d8bff', '#7b61ff', '#9b6dff', '#b4c5ff'];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createParticle(width: number, height: number): Particle {
  return {
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx: randomBetween(-0.4, 0.4),
    vy: randomBetween(-0.4, 0.4),
    r: randomBetween(1.5, 3),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: randomBetween(0.3, 0.8),
  };
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initCanvas = () => {
      const { offsetWidth, offsetHeight } = canvas.parentElement ?? canvas;
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
    };

    const initParticles = () => {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(canvas.width, canvas.height)
      );
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      // Update and draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x - p.r < 0) {
          p.x = p.r;
          p.vx = Math.abs(p.vx);
        } else if (p.x + p.r > width) {
          p.x = width - p.r;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y - p.r < 0) {
          p.y = p.r;
          p.vy = Math.abs(p.vy);
        } else if (p.y + p.r > height) {
          p.y = height - p.r;
          p.vy = -Math.abs(p.vy);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      // Draw connections
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * 0.25;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100, 140, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(draw);
    };

    initCanvas();
    initParticles();
    animFrameIdRef.current = requestAnimationFrame(draw);

    const resizeObserver = new ResizeObserver(() => {
      const prevWidth = canvas.width;
      const prevHeight = canvas.height;
      initCanvas();
      const newWidth = canvas.width;
      const newHeight = canvas.height;

      // Re-randomize particle positions proportionally
      for (const p of particlesRef.current) {
        p.x = (p.x / prevWidth) * newWidth;
        p.y = (p.y / prevHeight) * newHeight;
      }
    });

    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    } else {
      resizeObserver.observe(canvas);
    }

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
