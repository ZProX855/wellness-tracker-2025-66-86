
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
        let hue = 0;
        
        // Setup canvas
        p.setup = () => {
          p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
          p.colorMode(p.HSB, 100);
          p.noStroke();
          p.frameRate(30);
        };

        // Resize handler
        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
        };

        // Main draw loop
        p.draw = () => {
          p.clear();
          
          // Dynamic background color (very subtle)
          p.background(240, 10, 10, 0.05);
          
          // Set light sources
          const pointLight = p.color(60, 80, 100); // Blue
          const pointLight2 = p.color(90, 80, 100); // Purple
          p.pointLight(pointLight, 0, -300, 300);
          p.pointLight(pointLight2, 0, 300, -300);
          
          // Apply ambient light
          p.ambientLight(10, 10, 30);
          
          // Handle mouse interaction
          const mouseYRotation = p.map(p.mouseX, 0, p.width, -0.1, 0.1);
          const mouseXRotation = p.map(p.mouseY, 0, p.height, -0.1, 0.1);
          
          // Use mouse for rotation if mouse is near center of the screen
          const distFromCenter = p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2);
          const isMouseActive = distFromCenter < p.width/3;
          
          // Create main transformations
          p.push();
          p.translate(0, 0, 0);
          p.rotateY(angle * 0.5);
          p.rotateX(angle * 0.3);
          
          // Apply mouse-based rotation if mouse is active
          if (isMouseActive) {
            p.rotateX(mouseXRotation);
            p.rotateY(mouseYRotation);
          }
          
          // Create the abstract shape
          drawAbstractShape(p, angle);
          
          p.pop();
          
          // Update animation values
          angle += 0.01;
          hue = (hue + 0.1) % 100;
        };
        
        // Function to draw our abstract cyberpunk shape
        const drawAbstractShape = (p: p5, angle: number) => {
          // Create a series of shapes that form together
          const baseSize = Math.min(p.width, p.height) * 0.15;
          
          // Inner core - pulsing effect
          p.push();
          const pulseAmount = p.sin(angle * 2) * 0.1 + 0.9;
          p.fill(280, 70, 90, 0.8); // Purple
          p.scale(pulseAmount * 0.6);
          p.rotateX(angle * 0.7);
          p.rotateY(angle * 0.6);
          p.torus(baseSize * 0.5, baseSize * 0.1);
          p.pop();
          
          // Middle layer
          p.push();
          p.fill(220, 80, 90, 0.8); // Blue
          p.rotateX(angle * -0.5);
          p.rotateZ(angle * 0.3);
          const morphSize = p.sin(angle) * 0.1 + 1;
          p.scale(0.8 * morphSize);
          customShape(p, baseSize);
          p.pop();
          
          // Outer layer with glow effect
          p.push();
          p.fill(200, 80, 80, 0.3); // Lighter blue with transparency for glow
          p.rotateY(angle * -0.2);
          p.rotateZ(angle * -0.1);
          p.scale(1.2);
          p.torus(baseSize * 0.8, baseSize * 0.1);
          p.pop();
          
          // Create orbiting smaller elements
          for (let i = 0; i < 3; i++) {
            p.push();
            const orbitAngle = angle + (i * p.TWO_PI / 3);
            const orbitRadius = baseSize * 1.5;
            const x = p.sin(orbitAngle) * orbitRadius;
            const y = p.cos(orbitAngle) * orbitRadius * 0.5;
            
            p.translate(x, y, 0);
            p.fill(280 + i*15, 90, 90, 0.7); // Pink/purple gradients
            p.sphere(baseSize * 0.1);
            p.pop();
          }
        };
        
        // Custom abstract shape combining geometries
        const customShape = (p: p5, size: number) => {
          p.beginShape();
          for (let i = 0; i < 24; i++) {
            const ang = p.map(i, 0, 24, 0, p.TWO_PI);
            const rad = size * (0.6 + p.sin(ang * 3 + angle) * 0.2);
            const x = rad * p.cos(ang);
            const y = rad * p.sin(ang);
            const z = size * 0.3 * p.sin(ang * 2 + angle);
            p.vertex(x, y, z);
          }
          p.endShape(p.CLOSE);
        };
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
