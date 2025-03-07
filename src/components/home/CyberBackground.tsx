
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface CyberBackgroundProps {
  scrollY: number;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ scrollY }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sketch: p5;
    let shapes: Array<Shape3D> = [];
    let particles: Array<Particle> = [];
    let lastScrollY = 0;
    
    class Shape3D {
      position: p5.Vector;
      velocity: p5.Vector;
      acceleration: p5.Vector;
      rotationX: number;
      rotationY: number;
      rotationZ: number;
      rotationSpeedX: number;
      rotationSpeedY: number;
      rotationSpeedZ: number;
      size: number;
      color: p5.Color;
      glowColor: p5.Color;
      maxSpeed: number;
      centerAvoidanceRadius: number;
      seed: number;
      targetPosition: p5.Vector;
      lerp: number;
      shapeType: 'box' | 'sphere' | 'cone' | 'torus';

      constructor(p: p5, x: number, y: number, size: number) {
        this.position = p.createVector(x, y);
        this.velocity = p5.Vector.random2D().mult(p.random(0.2, 0.8));
        this.acceleration = p.createVector(0, 0);
        
        // 3D rotation properties
        this.rotationX = p.random(0, p.TWO_PI);
        this.rotationY = p.random(0, p.TWO_PI);
        this.rotationZ = p.random(0, p.TWO_PI);
        
        this.rotationSpeedX = p.random(0.001, 0.005) * (Math.random() > 0.5 ? 1 : -1);
        this.rotationSpeedY = p.random(0.001, 0.005) * (Math.random() > 0.5 ? 1 : -1);
        this.rotationSpeedZ = p.random(0.001, 0.005) * (Math.random() > 0.5 ? 1 : -1);
        
        this.size = size;
        
        // Green-cyan color palette for cyber aesthetic
        this.color = p.color(
          p.random(100, 150), // Red component (low for green/cyan)
          p.random(200, 255), // Green component (high)
          p.random(180, 255), // Blue component (medium-high for cyan tint)
          p.random(120, 180)  // Alpha (transparency)
        );
        
        // Glow color (brighter)
        this.glowColor = p.color(
          p.random(150, 200), // Red component
          p.random(230, 255), // Green component (high)
          p.random(200, 255), // Blue component
          p.random(150, 200)  // Alpha (transparency)
        );
        
        this.maxSpeed = p.random(0.3, 0.7);
        this.centerAvoidanceRadius = p.width / 1.8; // Increased radius to avoid center
        this.seed = p.random(1000); // Random seed for perlin noise
        this.targetPosition = p.createVector(x, y);
        this.lerp = 0.05;
        
        // Randomly choose a 3D shape type
        const shapes = ['box', 'sphere', 'cone', 'torus'] as const;
        this.shapeType = shapes[Math.floor(p.random(shapes.length))];
      }

      update(p: p5, frameCount: number, scrollDelta: number) {
        // Update rotation angles based on rotation speeds
        this.rotationX += this.rotationSpeedX;
        this.rotationY += this.rotationSpeedY;
        this.rotationZ += this.rotationSpeedZ;
        
        // Apply scroll influence to motion with damping
        const scrollInfluence = p.createVector(0, scrollDelta * 0.08);
        scrollInfluence.limit(0.4); // Limit the scroll effect
        this.applyForce(scrollInfluence);
        
        // Autonomous movement using perlin noise with less jitter
        const noiseScale = 0.0006; // Reduced for smoother movement
        const noiseX = p.map(p.noise(this.seed + frameCount * noiseScale), 0, 1, -1, 1);
        const noiseY = p.map(p.noise(this.seed + 500 + frameCount * noiseScale), 0, 1, -1, 1);
        const noiseZ = p.map(p.noise(this.seed + 1000 + frameCount * noiseScale), 0, 1, -0.5, 0.5);
        const noiseForce = p.createVector(noiseX, noiseY, noiseZ);
        noiseForce.mult(0.04); // Gentler force
        this.applyForce(noiseForce);
        
        // Strong center avoidance force
        const center = p.createVector(0, 0);
        const distToCenter = p.dist(this.position.x, this.position.y, center.x, center.y);
        
        if (distToCenter < this.centerAvoidanceRadius) {
          // Create a force that points away from center
          const avoidForce = p5.Vector.sub(this.position, center);
          // Stronger avoidance as we get closer to center
          const strength = p.map(distToCenter, 0, this.centerAvoidanceRadius, 0.12, 0);
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
        const bound = p.width / 1.6; // Boundary area
        
        // Seamless wrapping behavior with interpolation for X-axis
        if (this.targetPosition.x > bound) {
          this.targetPosition.x = -bound + padding;
          this.position.x = -bound + padding;
        } else if (this.targetPosition.x < -bound) {
          this.targetPosition.x = bound - padding;
          this.position.x = bound - padding;
        }
        
        // Seamless wrapping behavior with interpolation for Y-axis
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
        
        // Position the shape
        p.translate(this.position.x, this.position.y);
        
        // Apply 3D rotations
        p.rotateX(this.rotationX);
        p.rotateY(this.rotationY);
        p.rotateZ(this.rotationZ);
        
        // Calculate distance to mouse for dynamic lighting
        const distToMouse = p.dist(
          mouseX, mouseY, 
          this.position.x + p.width/2, this.position.y + p.height/2
        );
        const lightInfluence = p.constrain(p.map(distToMouse, 0, 300, 1.5, 0.8), 0.8, 1.5);
        
        // Apply material properties
        p.specularMaterial(p.red(this.color), p.green(this.color), p.blue(this.color), p.alpha(this.color));
        p.shininess(30 * lightInfluence);
        
        // Draw the selected 3D shape
        switch (this.shapeType) {
          case 'box':
            p.box(this.size);
            break;
          case 'sphere':
            p.sphere(this.size / 2);
            break;
          case 'cone':
            p.cone(this.size / 2, this.size);
            break;
          case 'torus':
            p.torus(this.size / 2, this.size / 4);
            break;
        }
        
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
        // Cyan/blue particles
        this.color = p.color(
          p.random(100, 180),
          p.random(220, 255),
          p.random(220, 255),
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
        p.push();
        p.translate(this.pos.x, this.pos.y, 0);
        p.sphere(this.size / 2);
        p.pop();
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
        
        // Create shapes away from center
        for (let i = 0; i < 16; i++) {
          // Create positions avoiding the center
          let x, y;
          do {
            x = p.random(-p.width/2, p.width/2);
            y = p.random(-p.height/2, p.height/2);
          } while (p.dist(x, y, 0, 0) < p.width/3); // Avoid center
          
          shapes.push(new Shape3D(p, x, y, p.random(40, 100)));
        }
      };

      p.draw = () => {
        p.clear();
        
        // Calculated scroll delta with damping
        const scrollDelta = scrollY - lastScrollY;
        lastScrollY = lastScrollY + (scrollY - lastScrollY) * 0.1; // Smooth scrolling
        
        // Background with less opacity for better contrast
        p.background(0, 0, 0, 5);
        
        // Smoothly track mouse position for lighting
        const targetMouseX = p.mouseX;
        const targetMouseY = p.mouseY;
        mouseXNorm = mouseXNorm + (targetMouseX - mouseXNorm) * 0.05;
        mouseYNorm = mouseYNorm + (targetMouseY - mouseYNorm) * 0.05;
        
        // Calculate normalized mouse positions
        const mouseXPos = (mouseXNorm / p.width) * 2 - 1;
        const mouseYPos = (mouseYNorm / p.height) * 2 - 1;
        
        // Enhanced lighting effects for 3D shapes
        p.ambientLight(50, 70, 80); // Subtle ambient light
        
        // Directional light that follows the mouse
        p.directionalLight(
          150, 255, 230,  // Cyan tint
          mouseXPos,
          mouseYPos,
          -0.5
        );
        
        // Point light at the mouse position for interactive highlights
        p.pointLight(
          200, 255, 250,  // Brighter cyan
          mouseXPos * p.width/2,
          mouseYPos * p.height/2,
          200
        );
        
        // Add occasional particles for sparkle effects
        if (p.random(1) < 0.3) {
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
        
        // Update and draw all shapes with the current frame count and scroll delta
        for (const shape of shapes) {
          shape.update(p, p.frameCount, scrollDelta);
          shape.draw(p, mouseXNorm - p.width/2, mouseYNorm - p.height/2);
          
          // Add small particles around shapes occasionally
          if (p.random(1) < 0.04) {
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
        // Update center avoidance radius for shapes
        for (const shape of shapes) {
          shape.centerAvoidanceRadius = p.width / 1.8;
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
