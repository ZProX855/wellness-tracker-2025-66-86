
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface CyberBackgroundProps {
  className?: string;
  scrollY?: number;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ className, scrollY = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<p5 | null>(null);
  const scrollYRef = useRef(scrollY);
  const canvasCreatedRef = useRef(false);

  // Update ref when scrollY changes
  useEffect(() => {
    scrollYRef.current = scrollY;
  }, [scrollY]);

  useEffect(() => {
    // Clear any previous instances
    if (sketchRef.current) {
      console.log("Removing previous p5 instance");
      sketchRef.current.remove();
      sketchRef.current = null;
      canvasCreatedRef.current = false;
    }

    // Only create the sketch once
    if (containerRef.current) {
      const sketch = (p: p5) => {
        // Core animation variables
        let time = 0;
        let shapes: FloatingShape[] = [];
        let particles: Particle[] = [];
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;
        let canvasElement: HTMLElement | null = null;
        
        // Visual elements configuration
        const NUM_SHAPES = 8;
        const NUM_PARTICLES = 60;
        const PRIMARY_COLOR = [104, 166, 136]; // Wellness green in RGB
        const SECONDARY_COLOR = [70, 88, 78];  // Darker variant
        const ACCENT_COLOR = [240, 248, 235];  // Light accent

        // Setup canvas
        p.setup = () => {
          console.log("P5 setup running - creating canvas...");
          p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
          p.pixelDensity(Math.min(window.devicePixelRatio, 2)); // Performance optimization for high-DPI screens
          p.colorMode(p.RGB, 255, 255, 255, 1);
          p.smooth();
          
          // Check if canvas was created
          canvasElement = document.querySelector('canvas.p5Canvas');
          if (canvasElement) {
            console.log("Canvas successfully created");
            canvasCreatedRef.current = true;
            
            // Apply canvas styles
            canvasElement.style.display = 'block';
            canvasElement.style.position = 'fixed';
            canvasElement.style.top = '0';
            canvasElement.style.left = '0';
            canvasElement.style.width = '100%';
            canvasElement.style.height = '100%';
            canvasElement.style.zIndex = '-1';
            canvasElement.style.pointerEvents = 'none';
          } else {
            console.error("Failed to find canvas element after creation!");
          }
          
          // Initialize shapes with staggered sizes and positions
          for (let i = 0; i < NUM_SHAPES; i++) {
            shapes.push(new FloatingShape(p, i));
          }
          
          // Initialize particles
          for (let i = 0; i < NUM_PARTICLES; i++) {
            particles.push(new Particle(p));
          }
          
          console.log("P5 setup complete");
        };

        // Handle window resize
        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
          console.log("Canvas resized to:", p.width, "x", p.height);
          
          // Re-check canvas element after resize
          if (!canvasElement) {
            canvasElement = document.querySelector('canvas.p5Canvas');
          }
        };
        
        // Process mouse movement for interactivity
        p.mouseMoved = () => {
          targetMouseX = p.mouseX;
          targetMouseY = p.mouseY;
        };

        // Main draw loop
        p.draw = () => {
          if (!canvasCreatedRef.current) {
            return;
          }
          
          // Smoothly follow mouse position for more elegant movement
          mouseX = p.lerp(mouseX, targetMouseX, 0.05);
          mouseY = p.lerp(mouseY, targetMouseY, 0.05);
          
          // Get current scroll position and convert to normalized value
          const currentScrollY = scrollYRef.current;
          const normalizedScroll = p.map(currentScrollY, 0, 1000, 0, 1);
          
          // Prepare canvas for rendering
          p.clear();
          
          // Set semi-transparent background with gradient
          setGradientBackground(p, normalizedScroll);
          
          // Create ambient light environment
          p.ambientLight(200, 200, 220, 0.5);
          
          // Set directional lights for depth
          const lightIntensity = 0.8 + p.sin(time * 0.5) * 0.1;
          p.directionalLight(
            PRIMARY_COLOR[0], 
            PRIMARY_COLOR[1], 
            PRIMARY_COLOR[2], 
            lightIntensity,
            0.5, 0.5, -1
          );
          
          p.directionalLight(
            ACCENT_COLOR[0],
            ACCENT_COLOR[1],
            ACCENT_COLOR[2],
            lightIntensity * 0.7,
            -0.5, -0.3, -0.5
          );
          
          // Draw all particles (background elements)
          for (let particle of particles) {
            particle.update(p, time, normalizedScroll);
            particle.display(p);
          }
          
          // Apply camera transformations based on mouse position
          p.translate(p.width / 2, p.height / 2);
          const mouseFactor = 0.03;
          p.rotateY((mouseX - p.width/2) * mouseFactor * 0.01);
          p.rotateX((mouseY - p.height/2) * mouseFactor * 0.01);
          
          // Apply scroll-based zoom and rotation
          const scrollScale = p.map(normalizedScroll, 0, 1, 1, 0.7);
          p.scale(scrollScale);
          p.rotateZ(normalizedScroll * 0.1);
          
          // Draw main floating shapes
          for (let shape of shapes) {
            shape.update(p, time, mouseX, mouseY, normalizedScroll);
            shape.display(p);
          }
          
          // Update time
          time += 0.01;
        };
        
        // Set gradient background using a combination of shapes
        const setGradientBackground = (p: p5, scroll: number) => {
          p.push();
          p.noLights();
          p.translate(0, 0, -500);
          
          // Create radial gradient effect with subtle interaction
          p.noStroke();
          
          // Base gradient
          const centerX = p.width/2 + (mouseX - p.width/2) * 0.1;
          const centerY = p.height/2 + (mouseY - p.height/2) * 0.1;
          
          for (let i = 12; i > 0; i--) {
            const alpha = p.map(i, 12, 0, 0.02, 0.15);
            const size = p.map(i, 12, 0, p.width * 2, 0);
            
            // Wellness green to dark background gradient
            const r = p.map(i, 12, 0, PRIMARY_COLOR[0] * 0.3, SECONDARY_COLOR[0]);
            const g = p.map(i, 12, 0, PRIMARY_COLOR[1] * 0.3, SECONDARY_COLOR[1]);
            const b = p.map(i, 12, 0, PRIMARY_COLOR[2] * 0.3, SECONDARY_COLOR[2]);
            
            p.fill(r, g, b, alpha);
            p.ellipse(centerX, centerY, size, size);
          }
          
          p.pop();
        };
        
        // Floating Shape class for the main visual elements
        class FloatingShape {
          private baseSize: number;
          private position: p5.Vector;
          private rotationSpeed: p5.Vector;
          private orbitRadius: number;
          private orbitSpeed: number;
          private shapeType: number;
          private phase: number;
          private color: number[];
          private index: number;
          
          constructor(p: p5, index: number) {
            this.index = index;
            
            // Size based on viewport dimensions for responsiveness
            const baseSize = Math.min(p.width, p.height) * 0.15;
            this.baseSize = baseSize * (0.4 + (index % 3) * 0.2);
            
            // Staggered positions for visual interest
            this.position = p.createVector(
              p.random(-p.width/5, p.width/5),
              p.random(-p.height/5, p.height/5),
              p.random(-100, 100)
            );
            
            // Rotation behaviors
            this.rotationSpeed = p.createVector(
              p.random(-0.01, 0.01),
              p.random(-0.01, 0.01),
              p.random(-0.01, 0.01)
            );
            
            // Orbit parameters
            this.orbitRadius = p.random(50, 150);
            this.orbitSpeed = p.random(0.05, 0.2) * (index % 2 === 0 ? 1 : -1);
            this.phase = p.random(p.TWO_PI);
            
            // Shape variety (0: sphere, 1: torus, 2: blob)
            this.shapeType = index % 3;
            
            // Color variations with wellness theme
            const hueOffset = p.random(-20, 20);
            this.color = [
              PRIMARY_COLOR[0] + hueOffset,
              PRIMARY_COLOR[1] + hueOffset,
              PRIMARY_COLOR[2] + hueOffset
            ];
          }
          
          update(p: p5, time: number, mouseX: number, mouseY: number, scroll: number) {
            // Update position based on orbital motion
            this.phase += this.orbitSpeed * (0.01 + scroll * 0.02);
            
            // React subtly to mouse position
            const mouseInfluence = p.map(
              p.dist(mouseX, mouseY, p.width/2, p.height/2),
              0, p.width/2,
              0.2, 0
            );
            
            const orbitX = Math.cos(this.phase + this.index) * this.orbitRadius * (1 + scroll * 0.2);
            const orbitY = Math.sin(this.phase + this.index) * this.orbitRadius * (1 + scroll * 0.2);
            const orbitZ = Math.sin(this.phase * 2) * this.orbitRadius * 0.5;
            
            this.position.x = orbitX + (mouseX - p.width/2) * mouseInfluence * 0.1;
            this.position.y = orbitY + (mouseY - p.height/2) * mouseInfluence * 0.1;
            this.position.z = orbitZ;
          }
          
          display(p: p5) {
            p.push();
            
            // Apply transformations
            p.translate(this.position.x, this.position.y, this.position.z);
            p.rotateX(this.phase * this.rotationSpeed.x);
            p.rotateY(this.phase * this.rotationSpeed.y);
            p.rotateZ(this.phase * this.rotationSpeed.z);
            
            // Set material and color
            p.specularMaterial(this.color[0], this.color[1], this.color[2]);
            p.shininess(30);
            
            // Render different shape types
            switch(this.shapeType) {
              case 0: // Sphere
                p.sphere(this.baseSize * (0.5 + Math.sin(this.phase * 2) * 0.1));
                break;
              case 1: // Torus
                p.torus(this.baseSize * 0.8, this.baseSize * 0.3);
                break;
              case 2: // Custom blob shape
                this.drawBlobShape(p, this.baseSize);
                break;
            }
            
            p.pop();
          }
          
          // Custom organic blob shape
          drawBlobShape(p: p5, size: number) {
            p.beginShape();
            
            const detail = 24;
            const noiseScale = 3;
            const noiseStrength = 0.3;
            
            for (let i = 0; i <= detail; i++) {
              const lat = p.map(i, 0, detail, -p.HALF_PI, p.HALF_PI);
              const latRadius = size * Math.cos(lat);
              
              for (let j = 0; j <= detail; j++) {
                const lon = p.map(j, 0, detail, 0, p.TWO_PI);
                
                // Generate organic deformation
                const noiseValue = p.noise(
                  Math.cos(lon) * noiseScale + this.phase,
                  Math.sin(lon) * noiseScale,
                  Math.sin(lat) * noiseScale
                );
                
                const radius = size * (1 + noiseValue * noiseStrength);
                
                const x = Math.cos(lon) * Math.cos(lat) * radius;
                const y = Math.sin(lon) * Math.cos(lat) * radius;
                const z = Math.sin(lat) * radius;
                
                p.vertex(x, y, z);
              }
            }
            
            p.endShape();
          }
        }
        
        // Particle class for background atmosphere
        class Particle {
          private position: p5.Vector;
          private velocity: p5.Vector;
          private size: number;
          private opacity: number;
          private color: number[];
          
          constructor(p: p5) {
            // Random position across the entire viewport
            this.position = p.createVector(
              p.random(-p.width, p.width),
              p.random(-p.height, p.height),
              p.random(-500, -100)
            );
            
            // Gentle movement
            this.velocity = p5.Vector.random3D().mult(p.random(0.2, 1));
            
            // Visual properties
            this.size = p.random(3, 10);
            this.opacity = p.random(0.1, 0.4);
            
            // Color variations with wellness theme
            const isAccent = p.random() > 0.8;
            const baseColor = isAccent ? ACCENT_COLOR : PRIMARY_COLOR;
            const variation = p.random(-30, 30);
            
            this.color = [
              baseColor[0] + variation,
              baseColor[1] + variation,
              baseColor[2] + variation
            ];
          }
          
          update(p: p5, time: number, scroll: number) {
            // Move based on velocity
            this.position.add(this.velocity);
            
            // Reset particle when it moves out of view
            if (
              this.position.x < -p.width || this.position.x > p.width ||
              this.position.y < -p.height || this.position.y > p.height ||
              this.position.z > 200
            ) {
              this.position = p.createVector(
                p.random(-p.width, p.width),
                p.random(-p.height, p.height),
                -500
              );
              
              // Adjust velocity based on scroll for dynamic response
              const scrollFactor = 1 + scroll * 2;
              this.velocity = p5.Vector.random3D().mult(p.random(0.2, 1) * scrollFactor);
            }
            
            // Subtle size and opacity pulsing
            const pulse = (Math.sin(time * 2 + this.position.x * 0.01) + 1) * 0.5;
            this.opacity = p.map(pulse, 0, 1, 0.1, 0.4);
          }
          
          display(p: p5) {
            p.push();
            p.translate(this.position.x, this.position.y, this.position.z);
            p.noLights();
            p.noStroke();
            p.fill(
              this.color[0],
              this.color[1],
              this.color[2],
              this.opacity
            );
            
            // Use circle for better performance than sphere
            p.circle(0, 0, this.size);
            p.pop();
          }
        }
      };

      // Create the p5 instance
      console.log("Creating new P5 instance");
      sketchRef.current = new p5(sketch, containerRef.current);
      
      // Verify canvas creation
      setTimeout(() => {
        if (sketchRef.current && !canvasCreatedRef.current) {
          console.warn("Canvas not created after initialization. Attempting to reinitialize...");
          if (sketchRef.current) {
            sketchRef.current.remove();
            sketchRef.current = new p5(sketch, containerRef.current);
          }
        }
      }, 300);
    }

    // Cleanup function
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`fixed top-0 left-0 w-full h-full -z-10 overflow-hidden ${className || ''}`}
      style={{ pointerEvents: 'none' }} 
      data-testid="cyber-background"
    />
  );
};

export default CyberBackground;
