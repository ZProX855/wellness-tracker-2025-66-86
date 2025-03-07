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

  // Update ref when scrollY changes
  useEffect(() => {
    scrollYRef.current = scrollY;
  }, [scrollY]);

  useEffect(() => {
    // Only create the sketch once
    if (containerRef.current && !sketchRef.current) {
      const sketch = (p: p5) => {
        let angle = 0;
        let shapes: Shape[] = [];
        let numShapes = 15;
        
        // Setup canvas
        p.setup = () => {
          console.log("P5 setup is running"); // Debug log
          const canvas = p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
          canvas.style('display', 'block');
          canvas.style('position', 'fixed');
          canvas.style('top', '0');
          canvas.style('left', '0');
          canvas.style('z-index', '-1');
          p.colorMode(p.HSB, 100);
          p.noStroke();
          p.frameRate(30);
          
          // Create shape objects
          for (let i = 0; i < numShapes; i++) {
            shapes.push(new Shape(p));
          }
        };

        // Resize handler
        p.windowResized = () => {
          console.log("P5 resize event"); // Debug log
          p.resizeCanvas(window.innerWidth, window.innerHeight);
        };

        // Main draw loop
        p.draw = () => {
          p.clear();
          
          // Add a more visible background
          p.background(70, 10, 10, 0.4); // Increased opacity for better visibility
          
          // Set light sources - wellness themed colors
          const greenLight = p.color(140, 80, 90); // Green for wellness
          const orangeLight = p.color(25, 90, 95);  // Orange for energy
          const blueLight = p.color(195, 85, 95);   // Blue for tranquility
          
          p.pointLight(greenLight, -300, 0, 300);
          p.pointLight(orangeLight, 300, -200, -300);
          p.pointLight(blueLight, 0, 300, -200);
          
          // Apply ambient light - increase intensity
          p.ambientLight(80, 10, 90); // Brighter ambient light
          
          // Handle mouse interaction
          const mouseYRotation = p.map(p.mouseX, 0, p.width, -0.1, 0.1);
          const mouseXRotation = p.map(p.mouseY, 0, p.height, -0.1, 0.1);
          
          // Get scroll position from ref
          const currentScrollY = scrollYRef.current;
          
          // Scale based on scroll position - make starting scale larger
          const scrollScale = p.map(currentScrollY, 0, 1000, 1.5, 1.2); // Larger initial scale
          const scrollRotation = currentScrollY * 0.001;
          
          // Create main transformations
          p.push();
          p.translate(0, 0, 0);
          
          // Apply mouse-based rotation
          p.rotateY(mouseYRotation + angle * 0.2);
          p.rotateX(mouseXRotation + angle * 0.1);
          
          // Apply scroll-based transformations
          p.scale(scrollScale);
          p.rotateZ(scrollRotation);
          
          // Draw the wellness core
          drawWellnessCore(p, angle, currentScrollY);
          
          // Draw all shapes
          for (let shape of shapes) {
            shape.display(p, angle, currentScrollY);
          }
          
          p.pop();
          
          // Update animation values
          angle += 0.005; // Slower rotation for a more relaxed feel
        };
        
        // Function to draw the wellness core
        const drawWellnessCore = (p: p5, angle: number, scrollY: number) => {
          const baseSize = Math.min(p.width, p.height) * 0.18; // Increased from 0.12
          const scrollEffect = p.map(scrollY, 0, 500, 0, 0.5);
          
          // Inner pulsing core (green)
          p.push();
          const pulseAmount = p.sin(angle * 3) * 0.1 + 1;
          // Green for health and wellness
          p.fill(140, 90, 90, 0.95); // Increased opacity 
          p.scale(pulseAmount * 0.6);
          p.rotateX(angle * 0.5 + scrollEffect);
          p.rotateZ(angle * 0.3);
          
          // Create organic heart-like core shape
          p.beginShape();
          for (let i = 0; i < 36; i++) {
            const ang = p.map(i, 0, 36, 0, p.TWO_PI);
            // Heart-like shape
            const rad = baseSize * (0.5 + 
              p.sin(ang * 2 + angle * 2) * 0.3 * 
              (1 + p.sin(ang) * 0.2));
            const x = rad * p.cos(ang);
            const y = rad * p.sin(ang);
            const z = baseSize * 0.3 * p.sin(ang * 4 + angle * 1.5);
            p.vertex(x, y, z);
          }
          p.endShape(p.CLOSE);
          p.pop();
          
          // Middle layer (orange energy)
          p.push();
          // Orange for energy
          p.fill(25, 95, 95, 0.8); // Increased opacity
          p.rotateX(angle * -0.4 + scrollEffect * 2);
          p.rotateZ(angle * 0.2);
          const morphSize = p.sin(angle * 2) * 0.15 + 1;
          p.scale(0.8 * morphSize);
          // Draw a wellness symbol
          drawWellnessSymbol(p, baseSize, angle);
          p.pop();
          
          // Outer glow layer (blue)
          p.push();
          // Blue for tranquility
          p.fill(195, 80, 95, 0.6); // Increased opacity
          p.rotateY(angle * -0.3 + scrollEffect);
          p.rotateZ(angle * -0.2);
          p.scale(1.2);
          p.torus(baseSize * 0.9, baseSize * 0.06);
          p.pop();
        };
        
        // Function to draw a wellness symbol
        const drawWellnessSymbol = (p: p5, size: number, angle: number) => {
          p.push();
          
          // Draw a balanced symbol representing wellness
          const sphereSize = size * 0.3;
          
          // Draw a circular arrangement of small spheres
          for (let i = 0; i < 8; i++) {
            p.push();
            const ang = i * p.TWO_PI / 8 + angle;
            const x = size * 0.7 * p.cos(ang);
            const y = size * 0.7 * p.sin(ang);
            p.translate(x, y, 0);
            p.sphere(sphereSize * 0.4);
            p.pop();
          }
          
          // Central sphere
          p.sphere(sphereSize);
          
          p.pop();
        };
        
        // Shape class for organic elements
        class Shape {
          position: p5.Vector;
          size: number;
          rotSpeed: number;
          hue: number;
          orbitRadius: number;
          orbitSpeed: number;
          phase: number;
          type: number;
          
          constructor(p: p5) {
            const baseSize = Math.min(p.width, p.height) * 0.05; // Increased from 0.03
            this.size = baseSize * (0.8 + p.random(0.5));
            this.rotSpeed = p.random(0.5, 1.5);
            
            // Color variations for wellness theme
            // Green, blue, orange range for fitness and wellness
            this.hue = p.random([140, 195, 25, 45]); 
            
            // Orbital parameters
            this.orbitRadius = p.random(1.5, 3) * baseSize * 3;
            this.orbitSpeed = p.random(0.3, 1.2);
            this.phase = p.random(p.TWO_PI);
            
            // Determine shape type
            this.type = Math.floor(p.random(3));
            
            // Initial position
            this.position = p5.Vector.random3D().mult(this.orbitRadius);
          }
          
          display(p: p5, globalAngle: number, scrollY: number) {
            const scrollEffect = p.map(scrollY, 0, 500, 0, 0.5);
            
            p.push();
            
            // Calculate orbit position with scroll influence
            const orbitFactor = 1 + scrollEffect * 0.3;
            const orbitX = Math.cos(this.phase + globalAngle * this.orbitSpeed) * this.orbitRadius * orbitFactor;
            const orbitY = Math.sin(this.phase + globalAngle * this.orbitSpeed) * this.orbitRadius * 0.6 * orbitFactor;
            const orbitZ = Math.sin(this.phase * 2 + globalAngle * this.orbitSpeed) * this.orbitRadius * 0.3 * orbitFactor;
            
            p.translate(orbitX, orbitY, orbitZ);
            p.rotateX(globalAngle * this.rotSpeed + scrollEffect);
            p.rotateZ(globalAngle * this.rotSpeed * 0.7);
            
            // Draw shape based on type
            p.fill(this.hue, 85, 90, 0.9);
            
            switch(this.type) {
              case 0:
                // Leaf/Petal shape
                this.drawLeafShape(p, this.size);
                break;
              case 1:
                // Water droplet for hydration
                this.drawDropShape(p, this.size);
                break;
              case 2:
                // Small energy burst
                this.drawEnergyShape(p, this.size);
                break;
            }
            
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
            p.translate(0, 0, size * 0.01);
            p.beginShape();
            p.vertex(0, -leafLength/2, 0);
            p.vertex(0, leafLength/2, 0);
            p.endShape();
            p.pop();
          }
          
          drawDropShape(p: p5, size: number) {
            // Water droplet shape for hydration
            p.push();
            p.rotateX(p.PI);
            p.beginShape();
            
            for (let angle = 0; angle < p.TWO_PI; angle += 0.1) {
              let r = size * 0.8 * (1 - Math.sin(angle) * 0.3);
              let x = r * Math.cos(angle);
              let y = r * Math.sin(angle);
              let z = size * Math.sin(angle) * 0.3;
              p.vertex(x, y, z);
            }
            
            p.endShape(p.CLOSE);
            p.pop();
          }
          
          drawEnergyShape(p: p5, size: number) {
            // Energy burst shape
            p.push();
            
            const spikes = 5;
            const innerRadius = size * 0.4;
            const outerRadius = size;
            
            p.beginShape();
            for (let i = 0; i < spikes * 2; i++) {
              const angle = p.map(i, 0, spikes * 2, 0, p.TWO_PI);
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              p.vertex(x, y, 0);
            }
            p.endShape(p.CLOSE);
            
            p.pop();
          }
        }
      };

      // Create the p5 instance with a callback to get the instance
      console.log("Creating P5 instance"); // Debug log
      sketchRef.current = new p5(sketch, containerRef.current);
      console.log("P5 instance created:", sketchRef.current); // Debug log
    }

    // Cleanup function
    return () => {
      console.log("Cleaning up P5 instance"); // Debug log
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
      style={{ pointerEvents: 'none' }} // Ensure it doesn't block interactions
      data-testid="cyber-background" // Add a test ID for debugging
    />
  );
};

export default CyberBackground;
