
import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

interface CyberBackgroundProps {
  scrollY: number;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ scrollY }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosX, setMousePosX] = useState(0);
  const [mousePosY, setMousePosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let sketch: p5;
    let shapes: Array<Shape> = [];
    let particles: Array<Particle> = [];
    
    class Shape {
      position: p5.Vector;
      targetPosition: p5.Vector;
      rotation: p5.Vector;
      size: number;
      complexity: number;
      originalSize: number;
      color: p5.Color;
      secondaryColor: p5.Color;
      isDragged: boolean = false;

      constructor(p: p5, x: number, y: number, size: number) {
        this.position = p.createVector(x, y);
        this.targetPosition = p.createVector(x, y);
        this.rotation = p.createVector(
          p.random(0, p.TWO_PI),
          p.random(0, p.TWO_PI),
          p.random(0, p.TWO_PI)
        );
        this.size = size;
        this.originalSize = size;
        this.complexity = p.random(4, 8);
        
        // Create green color with transparency
        this.color = p.color(
          p.random(100, 150), // Red component (low for green)
          p.random(200, 255), // Green component (high)
          p.random(100, 150), // Blue component (low for green)
          p.random(40, 80)    // Alpha (transparency)
        );
        
        // Secondary color for highlights
        this.secondaryColor = p.color(
          p.random(150, 200), // Red component
          p.random(220, 255), // Green component (high)
          p.random(150, 200), // Blue component
          p.random(60, 100)   // Alpha (transparency)
        );
      }

      update(p: p5, mouseX: number, mouseY: number, isDragging: boolean, dragOffsetX: number, dragOffsetY: number, scale: number) {
        // Apply a smooth easing effect to the movement
        const easing = 0.03;
        
        // Update rotation with a smooth, continuous motion
        this.rotation.x += 0.003;
        this.rotation.y += 0.002;
        this.rotation.z += 0.001;
        
        // Apply scaling
        this.size = this.originalSize * scale;
        
        // Handle dragging
        if (isDragging) {
          const distToMouse = p.dist(mouseX, mouseY, this.position.x, this.position.y);
          
          // If mouse is close to the shape, make it follow the mouse
          if (distToMouse < this.size * 1.5) {
            this.isDragged = true;
            this.targetPosition.x = mouseX + dragOffsetX;
            this.targetPosition.y = mouseY + dragOffsetY;
          }
        } else {
          this.isDragged = false;
        }
        
        // Apply smooth movement towards the target position
        this.position.x += (this.targetPosition.x - this.position.x) * easing;
        this.position.y += (this.targetPosition.y - this.position.y) * easing;
      }

      draw(p: p5) {
        p.push();
        p.translate(this.position.x, this.position.y);
        p.rotateX(this.rotation.x);
        p.rotateY(this.rotation.y);
        p.rotateZ(this.rotation.z);
        
        // Apply a subtle glow effect if being dragged
        if (this.isDragged) {
          p.drawingContext.shadowBlur = 30;
          p.drawingContext.shadowColor = p.color(150, 255, 150, 100);
        } else {
          p.drawingContext.shadowBlur = 15;
          p.drawingContext.shadowColor = p.color(100, 200, 100, 50);
        }
        
        p.noStroke();
        p.fill(this.color);
        
        // Draw a more organic, complex shape
        this.drawOrganicShape(p);
        
        p.pop();
      }
      
      drawOrganicShape(p: p5) {
        // Create a more organic, smooth shape using beginShape()
        p.beginShape();
        
        const baseRadius = this.size;
        const petalCount = Math.floor(this.complexity);
        
        // Create smooth, curved petals
        for (let angle = 0; angle < p.TWO_PI; angle += 0.1) {
          // Create a wave pattern for the radius
          const waveR = p.sin(angle * petalCount) * 0.2 + 0.8;
          const r = baseRadius * waveR;
          
          const x = r * p.cos(angle);
          const y = r * p.sin(angle);
          const z = r * p.sin(angle * 2) * 0.3;
          
          p.vertex(x, y, z);
        }
        
        p.endShape(p.CLOSE);
        
        // Add inner details with the secondary color
        p.fill(this.secondaryColor);
        p.beginShape();
        for (let angle = 0; angle < p.TWO_PI; angle += 0.1) {
          const innerWaveR = p.sin(angle * (petalCount + 2)) * 0.1 + 0.4;
          const innerR = baseRadius * innerWaveR;
          
          const x = innerR * p.cos(angle);
          const y = innerR * p.sin(angle);
          const z = innerR * p.sin(angle * 3) * 0.2;
          
          p.vertex(x, y, z);
        }
        p.endShape(p.CLOSE);
      }
    }
    
    class Particle {
      pos: p5.Vector;
      vel: p5.Vector;
      acc: p5.Vector;
      size: number;
      color: p5.Color;
      lifespan: number;
      
      constructor(p: p5, x: number, y: number) {
        this.pos = p.createVector(x, y);
        this.vel = p5.Vector.random2D().mult(p.random(0.5, 2));
        this.acc = p.createVector(0, 0);
        this.size = p.random(2, 8);
        this.color = p.color(
          p.random(200, 255),
          p.random(240, 255),
          p.random(200, 255),
          p.random(100, 200)
        );
        this.lifespan = 255;
      }
      
      update(p: p5) {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.lifespan -= 3;
      }
      
      draw(p: p5) {
        p.noStroke();
        const c = this.color;
        p.fill(p.red(c), p.green(c), p.blue(c), this.lifespan);
        p.circle(this.pos.x, this.pos.y, this.size);
      }
      
      isDead() {
        return this.lifespan <= 0;
      }
    }

    const createSketch = (p: p5) => {
      let lastScrollY = 0;
      
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        canvas.addClass('p5Canvas');
        p.smooth();
        p.frameRate(60); // Higher frame rate for smoother animations
        p.colorMode(p.RGB, 255, 255, 255, 255);
        
        // Create several floating shapes
        for (let i = 0; i < 8; i++) {
          shapes.push(new Shape(
            p,
            p.random(-p.width/3, p.width/3),
            p.random(-p.height/3, p.height/3),
            p.random(50, 150)
          ));
        }
      };

      p.draw = () => {
        p.clear();
        p.background(245, 248, 250, 5); // Very subtle background
        
        // Apply global transformations
        p.translate(0, 0, -200);  // Push everything back for better 3D effect
        
        // Get normalized mouse positions from React state
        const mouseXNorm = (mousePosX / p.width) * 2 - 1;
        const mouseYNorm = (mousePosY / p.height) * 2 - 1;
        
        // Calculate scroll effect - smoother parallax
        const scrollEffect = (scrollY - lastScrollY) * 0.1;
        lastScrollY = lastScrollY + (scrollY - lastScrollY) * 0.1; // Smooth scrolling
        
        // Ambient light for overall illumination
        p.ambientLight(100, 150, 100);
        
        // Directional light that follows the mouse
        p.directionalLight(
          150, 255, 150,  // Green tint
          mouseXNorm,
          mouseYNorm,
          -0.5
        );
        
        // Point light at the mouse position for interactive highlights
        p.pointLight(
          200, 255, 200,  // Brighter green
          mouseXNorm * p.width/2,
          mouseYNorm * p.height/2,
          200
        );
        
        // Add occasional particles for sparkle effects
        if (p.random(1) < 0.1) {
          particles.push(new Particle(
            p,
            p.random(-p.width/2, p.width/2),
            p.random(-p.height/2, p.height/2)
          ));
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].update(p);
          particles[i].draw(p);
          if (particles[i].isDead()) {
            particles.splice(i, 1);
          }
        }
        
        // Update and draw all shapes
        for (const shape of shapes) {
          shape.update(p, mousePosX - p.width/2, mousePosY - p.height/2, isDragging, dragOffset.x, dragOffset.y, scale);
          shape.draw(p);
          
          // Add small particles around shapes for additional effect
          if (p.random(1) < 0.03) {
            particles.push(new Particle(
              p,
              shape.position.x + p.random(-shape.size/2, shape.size/2),
              shape.position.y + p.random(-shape.size/2, shape.size/2)
            ));
          }
        }
      };
      
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };
    
    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        setMousePosX(e.clientX);
        setMousePosY(e.clientY);
      }
    };
    
    // Handle mouse interactions for dragging
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setDragOffset({ x: 0, y: 0 }); // Reset drag offset
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // Handle mouse wheel for scaling
    const handleWheel = (e: WheelEvent) => {
      // Prevent the default scroll behavior when over the canvas
      e.preventDefault();
      
      // Update scale based on wheel direction
      const scaleChange = e.deltaY * -0.001;
      const newScale = Math.max(0.5, Math.min(2.5, scale + scaleChange));
      setScale(newScale);
    };

    // Initialize the p5 sketch
    if (containerRef.current) {
      sketch = new p5(createSketch, containerRef.current);
    }
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      sketch?.remove();
    };
  }, [scrollY, mousePosX, mousePosY, isDragging, dragOffset, scale]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};

export default CyberBackground;
