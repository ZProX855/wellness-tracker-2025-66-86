
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
    let lastScrollY = 0;
    
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
      targetPosition: p5.Vector;
      lerp: number;

      constructor(p: p5, x: number, y: number, size: number) {
        this.position = p.createVector(x, y);
        this.velocity = p5.Vector.random2D().mult(p.random(0.2, 0.8));
        this.acceleration = p.createVector(0, 0);
        this.rotation = p.random(0, p.TWO_PI);
        this.rotationSpeed = p.random(0.001, 0.005) * (Math.random() > 0.5 ? 1 : -1);
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
        
        this.maxSpeed = p.random(0.3, 0.7);
        this.centerAvoidanceRadius = p.width / 2; // Increased radius to avoid center
        this.seed = p.random(1000); // Random seed for perlin noise
        this.targetPosition = p.createVector(x, y);
        this.lerp = 0.05;
      }

      update(p: p5, frameCount: number, scrollDelta: number) {
        // Continuous rotation
        this.rotation += this.rotationSpeed;
        
        // Apply scroll influence to motion with damping
        const scrollInfluence = p.createVector(0, scrollDelta * 0.1);
        scrollInfluence.limit(0.5); // Limit the scroll effect
        this.applyForce(scrollInfluence);
        
        // Autonomous movement using perlin noise with less jitter
        const noiseScale = 0.0008; // Reduced for smoother movement
        const noiseX = p.map(p.noise(this.seed + frameCount * noiseScale), 0, 1, -1, 1);
        const noiseY = p.map(p.noise(this.seed + 500 + frameCount * noiseScale), 0, 1, -1, 1);
        const noiseForce = p.createVector(noiseX, noiseY);
        noiseForce.mult(0.03); // Gentler force
        this.applyForce(noiseForce);
        
        // Strong center avoidance force
        const center = p.createVector(0, 0);
        const distToCenter = p.dist(this.position.x, this.position.y, center.x, center.y);
        
        if (distToCenter < this.centerAvoidanceRadius) {
          // Create a force that points away from center
          const avoidForce = p5.Vector.sub(this.position, center);
          // Stronger avoidance as we get closer to center
          const strength = p.map(distToCenter, 0, this.centerAvoidanceRadius, 0.1, 0);
          avoidForce.normalize().mult(strength);
          this.applyForce(avoidForce);
        }
        
        // Apply soft bounds to keep circles in view
        this.applyBounds(p);
        
        // Update velocity and position with smoothing
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        
        // Create target position and smoothly move towards it
        this.targetPosition.add(this.velocity);
        this.position.lerp(this.targetPosition, this.lerp);
        
        this.acceleration.mult(0); // Reset acceleration
      }
      
      applyForce(force: p5.Vector) {
        this.acceleration.add(force);
      }
      
      applyBounds(p: p5) {
        const padding = this.size;
        const bound = p.width / 1.8; // Slightly smaller boundary to avoid edges
        
        // Wrapping behavior for X-axis
        if (this.targetPosition.x > bound) {
          this.targetPosition.x = -bound + padding;
          this.position.x = -bound + padding;
        } else if (this.targetPosition.x < -bound) {
          this.targetPosition.x = bound - padding;
          this.position.x = bound - padding;
        }
        
        // Wrapping behavior for Y-axis
        if (this.targetPosition.y > bound) {
          this.targetPosition.y = -bound + padding;
          this.position.y = -bound + padding;
        } else if (this.targetPosition.y < -bound) {
          this.targetPosition.y = bound - padding;
          this.position.y = bound - padding;
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
        p.drawingContext.shadowColor = p.color(120, 255, 150, 50);
        
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
        this.vel = p5.Vector.random2D().mult(p.random(0.2, 0.8));
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
        this.lifespan -= 1.5; // Slower fade for smoother transitions
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
      let mouseXNorm = 0;
      let mouseYNorm = 0;
      
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        canvas.addClass('p5Canvas');
        p.smooth();
        p.frameRate(60); // Higher frame rate for smoother animations
        p.colorMode(p.RGB, 255, 255, 255, 255);
        
        // Create circles away from center
        for (let i = 0; i < 18; i++) {
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
        
        // Calculated scroll delta with damping
        const scrollDelta = scrollY - lastScrollY;
        lastScrollY = lastScrollY + (scrollY - lastScrollY) * 0.1; // Smooth scrolling
        
        // Background with less opacity for better contrast
        p.background(245, 248, 250, 5);
        
        // Smoothly track mouse position for lighting
        const targetMouseX = p.mouseX;
        const targetMouseY = p.mouseY;
        mouseXNorm = mouseXNorm + (targetMouseX - mouseXNorm) * 0.05;
        mouseYNorm = mouseYNorm + (targetMouseY - mouseYNorm) * 0.05;
        
        // Calculate normalized mouse positions
        const mouseXPos = (mouseXNorm / p.width) * 2 - 1;
        const mouseYPos = (mouseYNorm / p.height) * 2 - 1;
        
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
        if (p.random(1) < 0.2) {
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
        
        // Update and draw all circles with the current frame count and scroll delta
        for (const circle of circles) {
          circle.update(p, p.frameCount, scrollDelta);
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
          circle.centerAvoidanceRadius = p.width / 2;
        }
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
