
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface CyberBackgroundProps {
  className?: string;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    // Only create the sketch once
    if (containerRef.current && !sketchRef.current) {
      const sketch = (p: p5) => {
        let angle = 0;
        let leaves: Leaf[] = [];
        let numLeaves = 12;
        
        // Setup canvas
        p.setup = () => {
          p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
          p.colorMode(p.HSB, 100);
          p.noStroke();
          p.frameRate(30);
          
          // Create leaf objects
          for (let i = 0; i < numLeaves; i++) {
            leaves.push(new Leaf(p));
          }
        };

        // Resize handler
        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
        };

        // Main draw loop
        p.draw = () => {
          p.clear();
          
          // Subtle background
          p.background(70, 10, 10, 0.05);
          
          // Set light sources
          const greenLight = p.color(120, 80, 90); // Green
          const orangeLight = p.color(30, 90, 95); // Orange
          const yellowLight = p.color(45, 85, 95); // Yellow
          
          p.pointLight(greenLight, -300, 0, 300);
          p.pointLight(orangeLight, 300, -200, -300);
          p.pointLight(yellowLight, 0, 300, -200);
          
          // Apply ambient light
          p.ambientLight(60, 10, 80);
          
          // Handle mouse interaction
          const mouseYRotation = p.map(p.mouseX, 0, p.width, -0.1, 0.1);
          const mouseXRotation = p.map(p.mouseY, 0, p.height, -0.1, 0.1);
          
          // Use mouse for rotation if mouse is near center of the screen
          const distFromCenter = p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2);
          const isMouseActive = distFromCenter < p.width/3;
          
          // Create main transformations
          p.push();
          p.translate(0, 0, 0);
          p.rotateY(angle * 0.2);
          p.rotateX(angle * 0.1);
          
          // Apply mouse-based rotation if mouse is active
          if (isMouseActive) {
            p.rotateX(mouseXRotation);
            p.rotateY(mouseYRotation);
          }
          
          // Draw the vitality core
          drawVitalityCore(p, angle);
          
          // Draw all leaves
          for (let leaf of leaves) {
            leaf.display(p, angle);
          }
          
          p.pop();
          
          // Update animation values
          angle += 0.01;
        };
        
        // Function to draw the vitality core
        const drawVitalityCore = (p: p5, angle: number) => {
          const baseSize = Math.min(p.width, p.height) * 0.12;
          
          // Inner pulsing core (green)
          p.push();
          const pulseAmount = p.sin(angle * 3) * 0.1 + 1;
          p.fill(120, 90, 90, 0.85); // Vibrant green
          p.scale(pulseAmount * 0.6);
          p.rotateX(angle * 0.5);
          p.rotateZ(angle * 0.3);
          
          // Create organic core shape
          p.beginShape();
          for (let i = 0; i < 36; i++) {
            const ang = p.map(i, 0, 36, 0, p.TWO_PI);
            const rad = baseSize * (0.5 + p.sin(ang * 3 + angle * 2) * 0.2);
            const x = rad * p.cos(ang);
            const y = rad * p.sin(ang);
            const z = baseSize * 0.3 * p.sin(ang * 4 + angle * 1.5);
            p.vertex(x, y, z);
          }
          p.endShape(p.CLOSE);
          p.pop();
          
          // Middle layer (orange energy)
          p.push();
          p.fill(25, 95, 95, 0.7); // Orange
          p.rotateX(angle * -0.4);
          p.rotateZ(angle * 0.2);
          const morphSize = p.sin(angle * 2) * 0.15 + 1;
          p.scale(0.8 * morphSize);
          drawDumbbellShape(p, baseSize, angle);
          p.pop();
          
          // Outer glow layer (yellow)
          p.push();
          p.fill(40, 80, 95, 0.4); // Yellow with transparency
          p.rotateY(angle * -0.3);
          p.rotateZ(angle * -0.2);
          p.scale(1.2);
          p.torus(baseSize * 0.9, baseSize * 0.06);
          p.pop();
        };
        
        // Function to draw a dumbbell-inspired shape
        const drawDumbbellShape = (p: p5, size: number, angle: number) => {
          p.push();
          // Left weight
          p.translate(-size * 0.7, 0, 0);
          p.sphere(size * 0.3);
          
          // Bar
          p.translate(size * 0.7, 0, 0);
          p.rotateZ(p.PI/2);
          p.cylinder(size * 0.06, size * 1.4);
          
          // Right weight
          p.translate(0, 0, 0);
          p.rotateZ(-p.PI/2);
          p.translate(size * 0.7, 0, 0);
          p.sphere(size * 0.3);
          p.pop();
        };
        
        // Leaf class to create organic leaf/vine elements
        class Leaf {
          position: p5.Vector;
          size: number;
          rotSpeed: number;
          hue: number;
          orbitRadius: number;
          orbitSpeed: number;
          phase: number;
          
          constructor(p: p5) {
            const baseSize = Math.min(p.width, p.height) * 0.03;
            this.size = baseSize * (0.8 + p.random(0.5));
            this.rotSpeed = p.random(0.5, 1.5);
            
            // Color variations of green
            this.hue = p.random(90, 135);
            
            // Orbital parameters
            this.orbitRadius = p.random(1.5, 3) * baseSize * 3;
            this.orbitSpeed = p.random(0.3, 1.2);
            this.phase = p.random(p.TWO_PI);
            
            // Initial position
            this.position = p5.Vector.random3D().mult(this.orbitRadius);
          }
          
          display(p: p5, globalAngle: number) {
            p.push();
            
            // Calculate orbit position
            const orbitX = Math.cos(this.phase + globalAngle * this.orbitSpeed) * this.orbitRadius;
            const orbitY = Math.sin(this.phase + globalAngle * this.orbitSpeed) * this.orbitRadius * 0.6;
            const orbitZ = Math.sin(this.phase * 2 + globalAngle * this.orbitSpeed) * this.orbitRadius * 0.3;
            
            p.translate(orbitX, orbitY, orbitZ);
            p.rotateX(globalAngle * this.rotSpeed);
            p.rotateZ(globalAngle * this.rotSpeed * 0.7);
            
            // Draw leaf
            p.fill(this.hue, 85, 90, 0.9);
            this.drawLeafShape(p, this.size);
            
            p.pop();
          }
          
          drawLeafShape(p: p5, size: number) {
            p.beginShape();
            // Create a leaf-like shape with gentle curves
            const leafWidth = size * 0.6;
            const leafLength = size * 1.5;
            
            // Draw the leaf outline using curved vertices
            p.vertex(0, -leafLength/2, 0); // Tip
            
            // Right side curve
            p.bezierVertex(
              leafWidth/3, -leafLength/4, 0,
              leafWidth/2, 0, 0,
              leafWidth/3, leafLength/4, 0
            );
            
            p.vertex(0, leafLength/2, 0); // Base
            
            // Left side curve
            p.bezierVertex(
              -leafWidth/3, leafLength/4, 0,
              -leafWidth/2, 0, 0,
              -leafWidth/3, -leafLength/4, 0
            );
            
            p.endShape(p.CLOSE);
            
            // Add a simple vein down the center
            p.push();
            p.fill(this.hue, 60, 70, 0.7);
            p.translate(0, 0, size * 0.01); // Slight offset to prevent z-fighting
            p.beginShape();
            p.vertex(0, -leafLength/2, 0);
            p.vertex(0, leafLength/2, 0);
            p.vertex(-leafWidth/10, leafLength/2.2, 0);
            p.vertex(0, leafLength/2.5, 0);
            p.vertex(leafWidth/10, leafLength/2.2, 0);
            p.vertex(0, leafLength/2, 0);
            p.endShape();
            p.pop();
          }
        }
      };

      // Create the p5 instance
      sketchRef.current = new p5(sketch, containerRef.current);
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
    />
  );
};

export default CyberBackground;
