
import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
  tail: { x: number; y: number }[];
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const shootingStars = useRef<ShootingStar[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const lastShootingStarTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initShootingStars();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create particles
    function initParticles() {
      particles.current = [];
      const particleCount = Math.min(Math.max(Math.floor(window.innerWidth * window.innerHeight / 10000), 50), 150);
      
      for (let i = 0; i < particleCount; i++) {
        // Generate colors with a purple/blue hue for Solana theme
        const colors = [
          'rgba(153, 69, 255, 0.8)',  // Purple
          'rgba(20, 241, 149, 0.8)',  // Blue/Green
          'rgba(0, 194, 255, 0.8)',   // Cyan
          'rgba(255, 255, 255, 0.8)'  // White
        ];
        
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    // Initialize shooting stars array
    function initShootingStars() {
      shootingStars.current = [];
      // Create 5 shooting star objects that will be activated randomly
      for (let i = 0; i < 5; i++) {
        shootingStars.current.push({
          x: 0,
          y: 0,
          length: 0,
          speed: 0,
          angle: 0,
          opacity: 0,
          active: false,
          tail: []
        });
      }
    }

    // Create a new shooting star
    function createShootingStar() {
      // Check the shooting stars array for an inactive star
      const inactiveStar = shootingStars.current.find(star => !star.active);
      if (!inactiveStar) return;

      const now = Date.now();
      // Only create a new shooting star if enough time has passed
      if (now - lastShootingStarTime.current < 5000) return;
      
      lastShootingStarTime.current = now;
      
      // 50% chance to actually create a star to make it more sparse
      if (Math.random() > 0.5) return;

      // Set up the shooting star properties
      inactiveStar.x = Math.random() * canvas.width;
      inactiveStar.y = Math.random() * (canvas.height * 0.5); // Start in upper half
      inactiveStar.length = Math.random() * 80 + 50; // Length between 50-130px
      inactiveStar.speed = Math.random() * 5 + 10; // Speed between 10-15px per frame
      inactiveStar.angle = (Math.PI / 4) + (Math.random() * Math.PI / 4); // Angle between 45-90 degrees (downward right)
      inactiveStar.opacity = 1;
      inactiveStar.active = true;
      inactiveStar.tail = [];
    }

    // Update and draw a shooting star
    function updateShootingStar(star: ShootingStar) {
      if (!star.active) return;

      // Move the star
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      
      // Add current position to the tail
      star.tail.push({ x: star.x, y: star.y });
      
      // Limit tail length
      if (star.tail.length > 10) {
        star.tail.shift();
      }
      
      // Check if the star is out of the canvas
      if (star.x > canvas.width || star.y > canvas.height) {
        star.active = false;
        star.tail = [];
      }
    }

    // Draw a shooting star
    function drawShootingStar(ctx: CanvasRenderingContext2D, star: ShootingStar) {
      if (!star.active || star.tail.length < 2) return;
      
      // Draw the tail with gradient
      const gradient = ctx.createLinearGradient(
        star.tail[0].x, star.tail[0].y, 
        star.tail[star.tail.length - 1].x, star.tail[star.tail.length - 1].y
      );
      
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      
      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.moveTo(star.tail[0].x, star.tail[0].y);
      
      for (let i = 1; i < star.tail.length; i++) {
        ctx.lineTo(star.tail[i].x, star.tail[i].y);
      }
      
      ctx.stroke();
      
      // Draw a bright point at the head
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      // Connect particles with lines if they're close enough
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const dx = particles.current[i].x - particles.current[j].x;
          const dy = particles.current[i].y - particles.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(153, 69, 255, ${0.2 * (1 - distance / 120)})`; // Purple with opacity based on distance
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles.current[i].x, particles.current[i].y);
            ctx.lineTo(particles.current[j].x, particles.current[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Randomly create shooting stars
      if (Math.random() < 0.005) { // ~0.5% chance per frame
        createShootingStar();
      }
      
      // Update and draw shooting stars
      shootingStars.current.forEach(star => {
        updateShootingStar(star);
        drawShootingStar(ctx, star);
      });
      
      animationFrameId.current = requestAnimationFrame(animate);
    }
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent'
      }}
    />
  );
};

export default ParticleBackground;
