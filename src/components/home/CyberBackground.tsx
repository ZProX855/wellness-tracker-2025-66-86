import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface CyberBackgroundProps {
  scrollY: number;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ scrollY }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sketch: p5;
    let circles: Array<Circle> = [];
    let particles: Array<Particle> = [];
    
    class Circle {
      position: p5.Vector;
      velocity: p5.Vector;
      acceleration: p5.Vector;
      rotation: number;
      rotationSpeed: number;
      size: number;
      color: p5.Color;
      glowColor: p5.Color;
      maxSpeed: number;
      centerAvoidanceRadius: number;
      seed: number;

      constructor(p: p5, x: number, y: number, size: number) {
        this.position = p.createVector(x, y);
        this.velocity = p5.Vector.random2D().mult(p.random(0.5, 1.5));
        this.acceleration = p.createVector(0, 0);
        this.rotation = p.random(0, p.TWO_PI);
        this.rotationSpeed = p.random(0.002, 0.01) * (Math.random() > 0.5 ? 1 : -1); // Clockwise or counter-clockwise
        this.size = size;
        
        // Green color palette with transparency
        this.color = p.color(
          p.random(100, 150), // Red component (low for green)
          p.random(200, 255), // Green component (high)
          p.random(100, 150), // Blue component (low for green)
          p.random(80, 180)   // Alpha (transparency)
        );
        
        // Glow color (brighter green)
        this.glowColor = p.color(
          p.random(150, 200), // Red component
          p.random(230, 255), // Green component (high)
          p.random(150, 200), // Blue component
          p.random(100, 200)  // Alpha (transparency)
        );
        
        this.maxSpeed = p.random(0.5, 1.2);
        this.centerAvoidanceRadius = p.width / 2.5; // Increased radius to avoid center
        this.seed = p.random(1000); // Random seed for perlin noise
      }

      update(p: p5, frameCount: number) {
        // Continuous rotation
        this.rotation += this.rotationSpeed;
        
        // Autonomous movement using perlin noise
        const noiseX = p.noise(this.seed + frameCount * 0.001) * 2 - 1;
        const noiseY = p.noise(this.seed + 500 + frameCount * 0.001) * 2 - 1;
        const noiseForce = p.createVector(noiseX, noiseY);
        noiseForce.mult(0.05);
        this.applyForce(noiseForce);
        
        // Strong center avoidance force
        const center = p.createVector(0, 0);
        const distToCenter = p.dist(this.position.x, this.position.y, center.x, center.y);
        
        if (distToCenter < this.centerAvoidanceRadius) {
          // Create a force that points away from center
          const avoidForce = p5.Vector.sub(this.position, center);
          // Stronger avoidance as we get closer to center
          const strength = p.map(distToCenter, 0, this.centerAvoidanceRadius, 0.08, 0);
          avoidForce.normalize().mult(strength);
          this.applyForce(avoidForce);
        }
        
        // Apply soft bounds to keep circles in view
        this.applyBounds(p);
        
        // Update velocity and position
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0); // Reset acceleration
      }
      
      applyForce(force: p5.Vector) {
        this.acceleration.add(force);
      }
      
      applyBounds(p: p5) {
        const padding = this.size;
        const bound = p.width / 2 - padding;
        
        if (this.position.x > bound) {
          const force = p.createVector(-0.05, 0);
          this.applyForce(force);
        } else if (this.position.x < -bound) {
          const force = p.createVector(0.05, 0);
          this.applyForce(force);
        }
        
        if (this.position.y > bound) {
          const force = p.createVector(0, -0.05);
          this.applyForce(force);
        } else if (this.position.y < -bound) {
          const force = p.createVector(0, 0.05);
          this.applyForce(force);
        }
      }

      draw(p: p5, mouseX: number, mouseY: number) {
        p.push();
        
        // Position the circle
        p.translate(this.position.x, this.position.y);
        p.rotate(this.rotation);
        
        // Calculate distance to mouse for dynamic lighting
        const distToMouse = p.dist(
          mouseX, mouseY, 
          this.position.x + p.width/2, this.position.y + p.height/2
        );
        const lightInfluence = p.constrain(p.map(distToMouse, 0, 300, 1.5, 0.8), 0.8, 1.5);
        
        // Apply glow effect based on mouse proximity
        p.drawingContext.shadowBlur = 15 * lightInfluence;
        p.drawingContext.shadowColor = p.color(120, 255, 150, 70);
        
        // Draw main circle with subtle gradient
        p.noStroke();
        p.fill(this.color);
        p.ellipse(0, 0, this.size, this.size);
        
        // Draw inner details
        p.fill(this.glowColor);
        p.ellipse(0, 0, this.size * 0.6, this.size * 0.6);
        
        // Draw a few additional circular patterns
        p.noFill();
        p.stroke(this.glowColor);
        p.strokeWeight(2);
        p.ellipse(0, 0, this.size * 0.8, this.size * 0.8);
        
        p.strokeWeight(1);
        p.stroke(255, 255, 255, 80);
        p.ellipse(0, 0, this.size * 0.4, this.size * 0.4);
        
        p.pop();
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
        this.vel = p5.Vector.random2D().mult(p.random(0.5, 1.5));
        this.acc = p.createVector(0, 0);
        this.size = p.random(2, 5);
        // Green/white particles
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
        this.lifespan -= 2;
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
      let mouseXNorm = 0;
      let mouseYNorm = 0;
      
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        canvas.addClass('p5Canvas');
        p.smooth();
        p.frameRate(60); // Higher frame rate for smoother animations
        p.colorMode(p.RGB, 255, 255, 255, 255);
        
        // Create circles away from center
        for (let i = 0; i < 15; i++) {
          // Create positions avoiding the center
          let x, y;
          do {
            x = p.random(-p.width/2, p.width/2);
            y = p.random(-p.height/2, p.height/2);
          } while (p.dist(x, y, 0, 0) < p.width/3); // Avoid center
          
          circles.push(new Circle(p, x, y, p.random(60, 180)));
        }
      };

      p.draw = () => {
        p.clear();
        p.background(245, 248, 250, 5); // Very subtle background
        
        // Smoothly track mouse position for lighting
        const targetMouseX = p.mouseX;
        const targetMouseY = p.mouseY;
        mouseXNorm = mouseXNorm + (targetMouseX - mouseXNorm) * 0.05;
        mouseYNorm = mouseYNorm + (targetMouseY - mouseYNorm) * 0.05;
        
        // Calculate normalized mouse positions
        const mouseXPos = (mouseXNorm / p.width) * 2 - 1;
        const mouseYPos = (mouseYNorm / p.height) * 2 - 1;
        
        // Calculate scroll effect - smoother parallax
        const scrollEffect = (scrollY - lastScrollY) * 0.05;
        lastScrollY = lastScrollY + (scrollY - lastScrollY) * 0.1; // Smooth scrolling
        
        // Lighting effects
        p.ambientLight(120, 150, 120);
        
        // Directional light that follows the mouse
        p.directionalLight(
          150, 255, 150,  // Green tint
          mouseXPos,
          mouseYPos,
          -0.5
        );
        
        // Point light at the mouse position for interactive highlights
        p.pointLight(
          200, 255, 200,  // Brighter green
          mouseXPos * p.width/2,
          mouseYPos * p.height/2,
          200
        );
        
        // Add occasional particles for sparkle effects
        if (p.random(1) < 0.1) {
          // Generate particles away from center
          let x, y;
          do {
            x = p.random(-p.width/2, p.width/2);
            y = p.random(-p.height/2, p.height/2);
          } while (p.dist(x, y, 0, 0) < p.width/4);
          
          particles.push(new Particle(p, x, y));
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].update(p);
          particles[i].draw(p);
          if (particles[i].isDead()) {
            particles.splice(i, 1);
          }
        }
        
        // Update and draw all circles with the current frame count for perlin noise
        for (const circle of circles) {
          circle.update(p, p.frameCount);
          circle.draw(p, mouseXNorm - p.width/2, mouseYNorm - p.height/2);
          
          // Add small particles around circles occasionally
          if (p.random(1) < 0.03) {
            particles.push(new Particle(
              p,
              circle.position.x + p.random(-circle.size/2, circle.size/2),
              circle.position.y + p.random(-circle.size/2, circle.size/2)
            ));
          }
        }
      };
      
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        // Update center avoidance radius for circles
        for (const circle of circles) {
          circle.centerAvoidanceRadius = p.width / 2.5;
        }
      };
      
      // Track mouse movement for lighting effects only
      p.mouseMoved = () => {
        // Just track the mouse - no direct interaction needed
      };
    };
    
    // Initialize the p5 sketch
    if (containerRef.current) {
      sketch = new p5(createSketch, containerRef.current);
    }
    
    // Cleanup
    return () => {
      sketch?.remove();
    };
  }, [scrollY]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};

export default CyberBackground;
