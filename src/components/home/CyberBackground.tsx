
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
        // Define Leaf class for high-detail leaves
        class DetailedLeaf {
          pos: p5.Vector;
          vel: p5.Vector;
          acc: p5.Vector;
          angle: number;
          angleVel: number;
          size: number;
          color: p5.Color;
          highColor: p5.Color;
          glowing: boolean;
          veins: number;
          detail: number;
          veinColor: p5.Color;
          type: number; // Different leaf shapes
          rotX: number;
          rotY: number;
          rotZ: number;
          targetRotX: number;
          targetRotY: number;
          targetRotZ: number;
          hovered: boolean;
          initialAlpha: number;
          maxSize: number;
          growFactor: number;
          
          constructor() {
            this.pos = p.createVector(
              p.random(-p.width/2, p.width/2),
              p.random(-p.height/2, p.height/2),
              p.random(-1000, -100)
            );
            
            this.vel = p.createVector(
              p.random(-0.2, 0.2),
              p.random(-0.1, 0.1),
              p.random(0.1, 0.5)
            );
            
            this.acc = p.createVector(0, 0, 0);
            this.angle = p.random(p.TWO_PI);
            this.angleVel = p.random(-0.01, 0.01);
            
            this.maxSize = p.random(30, 70);
            this.size = 0; // Start small and grow
            this.growFactor = p.random(0.01, 0.03);
            
            // Create a vibrant, varied green palette
            const hue = p.random(80, 140); // Green hues
            const saturation = p.random(70, 90);
            const brightness = p.random(40, 80);
            const initialAlpha = p.random(170, 255);
            this.initialAlpha = initialAlpha;
            
            this.color = p.color(hue, saturation, brightness, initialAlpha);
            this.highColor = p.color(hue, saturation, brightness + 20, 255); // Brighter when glowing
            this.veinColor = p.color(hue - 10, saturation - 20, brightness - 20, initialAlpha);
            
            this.glowing = false;
            this.veins = p.floor(p.random(3, 7));
            this.detail = p.floor(p.random(5, 15)); // Level of detail for leaf edges
            this.type = p.floor(p.random(4)); // Different leaf shapes
            
            // 3D rotation properties
            this.rotX = p.random(p.TWO_PI);
            this.rotY = p.random(p.TWO_PI);
            this.rotZ = p.random(p.TWO_PI);
            
            // Target rotation for smooth transitions
            this.targetRotX = this.rotX;
            this.targetRotY = this.rotY;
            this.targetRotZ = this.rotZ;
            
            this.hovered = false;
          }
          
          applyForce(force: p5.Vector) {
            this.acc.add(force);
          }
          
          update() {
            // Apply some wind effect based on mouse movement
            const windX = (p.mouseX - p.pmouseX) * 0.005;
            const windY = (p.mouseY - p.pmouseY) * 0.005;
            const wind = p.createVector(windX, windY, 0);
            this.applyForce(wind);
            
            // Basic physics
            this.vel.add(this.acc);
            this.vel.mult(0.99); // Drag
            this.pos.add(this.vel);
            this.acc.mult(0);
            
            // Rotation updates
            this.angle += this.angleVel;
            
            // Smooth rotation towards target
            this.rotX = p.lerp(this.rotX, this.targetRotX, 0.05);
            this.rotY = p.lerp(this.rotY, this.targetRotY, 0.05);
            this.rotZ = p.lerp(this.rotZ, this.targetRotZ, 0.05);
            
            // Grow leaf to max size
            if (this.size < this.maxSize) {
              this.size += (this.maxSize - this.size) * this.growFactor;
            }
            
            // Reset position when leaf goes off screen
            if (this.pos.z > 300) {
              this.pos.z = p.random(-1000, -800);
              this.pos.x = p.random(-p.width/2, p.width/2);
              this.pos.y = p.random(-p.height/2, p.height/2);
              
              // Randomize rotation again
              this.targetRotX = p.random(p.TWO_PI);
              this.targetRotY = p.random(p.TWO_PI);
              this.targetRotZ = p.random(p.TWO_PI);
              
              this.size = 0; // Reset size to grow again
            }
          }
          
          checkHover(mx: number, my: number) {
            // Convert to screen space (approximate)
            let screenX = this.pos.x;
            let screenY = this.pos.y;
            const depth = Math.max(0, 1 - this.pos.z / 300); // Scale based on z-depth
            
            const distance = p.dist(mx, my, screenX, screenY);
            const hitRadius = this.size * depth * 1.5; // Scale hit area by depth
            
            if (distance < hitRadius) {
              if (!this.hovered) {
                this.hovered = true;
                // Set glowing state
                this.glowing = true;
                
                // Create a small "wobble" effect when leaf is hovered
                this.targetRotX += p.random(-0.5, 0.5);
                this.targetRotY += p.random(-0.5, 0.5);
                
                // Change velocity slightly for an "affected by cursor" feel
                this.vel.add(p.createVector(
                  p.random(-0.5, 0.5),
                  p.random(-0.5, 0.5),
                  p.random(-0.2, 0.2)
                ));
              }
            } else if (this.hovered) {
              this.hovered = false;
              this.glowing = false;
            }
          }
          
          display() {
            p.push();
            p.translate(this.pos.x, this.pos.y, this.pos.z);
            
            // Apply 3D rotations
            p.rotateX(this.rotX);
            p.rotateY(this.rotY);
            p.rotateZ(this.rotZ);
            
            // Scale leaf based on depth
            const depth = Math.max(0, 1 - this.pos.z / 300);
            p.scale(depth);
            
            // Set fill color - glowing if hovered
            if (this.glowing) {
              p.fill(this.highColor);
              // Add ambient and point light for glow effect
              p.ambientLight(30, 50, 30);
              p.pointLight(100, 200, 100, 0, 0, 10);
            } else {
              // Adjust alpha based on depth
              const alpha = this.initialAlpha * depth;
              const adjustedColor = p.color(p.hue(this.color), p.saturation(this.color), 
                                          p.brightness(this.color), alpha);
              p.fill(adjustedColor);
            }
            
            // Draw different leaf types based on this.type
            p.noStroke(); // Start with no stroke
            
            if (this.type === 0) {
              // Maple-like leaf
              this.drawMapleLeaf();
            } else if (this.type === 1) {
              // Oak-like leaf
              this.drawOakLeaf();
            } else if (this.type === 2) {
              // Elliptical leaf
              this.drawEllipticalLeaf();
            } else {
              // Heart-shaped leaf
              this.drawHeartLeaf();
            }
            
            p.pop();
          }
          
          drawMapleLeaf() {
            const s = this.size;
            
            // Draw base shape
            p.beginShape();
            // Central point
            p.vertex(0, -s * 0.7);
            
            // Left side lobes (using bezier curves for smooth shapes)
            p.bezierVertex(-s * 0.3, -s * 0.6, -s * 0.5, -s * 0.4, -s * 0.6, -s * 0.1);
            p.bezierVertex(-s * 0.7, 0, -s * 0.8, s * 0.1, -s * 0.6, s * 0.2);
            p.bezierVertex(-s * 0.65, s * 0.15, -s * 0.7, s * 0.3, -s * 0.5, s * 0.4);
            
            // Bottom section
            p.bezierVertex(-s * 0.3, s * 0.5, -s * 0.2, s * 0.6, 0, s * 0.7);
            
            // Right side (mirror of left)
            p.bezierVertex(s * 0.2, s * 0.6, s * 0.3, s * 0.5, s * 0.5, s * 0.4);
            p.bezierVertex(s * 0.7, s * 0.3, s * 0.65, s * 0.15, s * 0.6, s * 0.2);
            p.bezierVertex(s * 0.8, s * 0.1, s * 0.7, 0, s * 0.6, -s * 0.1);
            p.bezierVertex(s * 0.5, -s * 0.4, s * 0.3, -s * 0.6, 0, -s * 0.7);
            
            p.endShape(p.CLOSE);
            
            // Draw veins
            this.drawVeins(s, 0);
          }
          
          drawOakLeaf() {
            const s = this.size;
            
            p.beginShape();
            // Start at the base
            p.vertex(0, s * 0.6);
            
            // Create wavy edges for the oak leaf
            const lobes = 5; // Number of lobes on each side
            for (let i = 0; i < lobes; i++) {
              const t = i / (lobes - 1);
              const x = p.lerp(0, -s * 0.6, t);
              const y = p.lerp(s * 0.6, -s * 0.6, t);
              
              // Create wavy edge effect
              const waveDepth = s * 0.15;
              p.bezierVertex(
                x - waveDepth, y + waveDepth * 0.5,
                x - waveDepth, y - waveDepth * 0.5,
                x, y - waveDepth
              );
              p.bezierVertex(
                x, y - waveDepth * 1.5,
                x + waveDepth * 0.5, y - waveDepth,
                x + waveDepth, y
              );
            }
            
            // Tip of the leaf
            p.vertex(0, -s * 0.6);
            
            // Right side (mirror of left)
            for (let i = lobes - 1; i >= 0; i--) {
              const t = i / (lobes - 1);
              const x = p.lerp(0, s * 0.6, t);
              const y = p.lerp(-s * 0.6, s * 0.6, t);
              
              // Create wavy edge effect (mirrored)
              const waveDepth = s * 0.15;
              p.bezierVertex(
                x + waveDepth * 0.5, y - waveDepth,
                x + waveDepth, y - waveDepth * 0.5,
                x + waveDepth, y + waveDepth * 0.5
              );
              p.bezierVertex(
                x + waveDepth, y + waveDepth * 1.5,
                x - waveDepth * 0.5, y + waveDepth,
                x, y + waveDepth
              );
            }
            
            p.endShape(p.CLOSE);
            
            // Draw veins
            this.drawVeins(s, 1);
          }
          
          drawEllipticalLeaf() {
            const s = this.size;
            
            p.beginShape();
            
            // Elliptical base shape
            const steps = 20;
            for (let i = 0; i < steps; i++) {
              const angle = p.map(i, 0, steps, 0, p.TWO_PI);
              // Elliptical coordinates
              const x = s * 0.6 * p.cos(angle);
              const y = s * p.sin(angle);
              
              // Add some noise to the edges for realism
              const noiseVal = p.noise(x * 0.1, y * 0.1, i * 0.1) * s * 0.1;
              p.vertex(x + noiseVal, y);
            }
            
            p.endShape(p.CLOSE);
            
            // Draw veins
            this.drawVeins(s, 2);
          }
          
          drawHeartLeaf() {
            const s = this.size;
            
            p.beginShape();
            // Base of the heart
            p.vertex(0, s * 0.7);
            
            // Left lobe
            p.bezierVertex(-s * 0.6, s * 0.4, -s * 0.8, -s * 0.4, 0, -s * 0.6);
            
            // Right lobe
            p.bezierVertex(s * 0.8, -s * 0.4, s * 0.6, s * 0.4, 0, s * 0.7);
            
            p.endShape(p.CLOSE);
            
            // Draw veins
            this.drawVeins(s, 3);
          }
          
          drawVeins(s: number, type: number) {
            p.push();
            p.noFill();
            p.stroke(this.veinColor);
            p.strokeWeight(this.size * 0.01);
            
            if (type === 0) {
              // Maple leaf veins
              for (let i = 0; i < this.veins; i++) {
                const angle = p.map(i, 0, this.veins - 1, -p.PI * 0.7, p.PI * 0.7);
                p.push();
                p.rotate(angle);
                p.beginShape();
                p.vertex(0, 0);
                p.bezierVertex(0, -s * 0.2, s * 0.1, -s * 0.4, s * 0.2, -s * 0.6);
                p.endShape();
                p.pop();
              }
            } else if (type === 1) {
              // Oak leaf veins
              p.line(0, s * 0.6, 0, -s * 0.6); // Central vein
              
              for (let i = 1; i <= this.veins; i++) {
                const y = p.map(i, 1, this.veins + 1, s * 0.4, -s * 0.4);
                // Left vein
                p.beginShape();
                p.vertex(0, y);
                p.bezierVertex(-s * 0.2, y, -s * 0.3, y - s * 0.1, -s * 0.4, y - s * 0.05);
                p.endShape();
                
                // Right vein
                p.beginShape();
                p.vertex(0, y);
                p.bezierVertex(s * 0.2, y, s * 0.3, y - s * 0.1, s * 0.4, y - s * 0.05);
                p.endShape();
              }
            } else if (type === 2) {
              // Elliptical leaf veins
              p.line(0, s, 0, -s); // Central vein
              
              for (let i = 1; i <= this.veins; i++) {
                const y = p.map(i, 1, this.veins + 1, s * 0.6, -s * 0.6);
                const curveStrength = s * 0.4;
                
                // Left vein
                p.beginShape();
                p.vertex(0, y);
                p.bezierVertex(-curveStrength * 0.5, y, -curveStrength * 0.7, y + s * 0.05, -s * 0.5, y + s * 0.1);
                p.endShape();
                
                // Right vein
                p.beginShape();
                p.vertex(0, y);
                p.bezierVertex(curveStrength * 0.5, y, curveStrength * 0.7, y + s * 0.05, s * 0.5, y + s * 0.1);
                p.endShape();
              }
            } else {
              // Heart leaf veins
              // Central vein
              p.line(0, s * 0.7, 0, -s * 0.6);
              
              // Side veins
              for (let i = 1; i <= this.veins; i++) {
                const y = p.map(i, 1, this.veins + 1, s * 0.5, -s * 0.4);
                const width = p.map(y, s * 0.5, -s * 0.4, s * 0.2, s * 0.5);
                
                // Left vein
                p.beginShape();
                p.vertex(0, y);
                p.bezierVertex(-width * 0.3, y, -width * 0.6, y - s * 0.1, -width, y - s * 0.05);
                p.endShape();
                
                // Right vein
                p.beginShape();
                p.vertex(0, y);
                p.bezierVertex(width * 0.3, y, width * 0.6, y - s * 0.1, width, y - s * 0.05);
                p.endShape();
              }
            }
            
            p.pop();
          }
        }
        
        let leaves: DetailedLeaf[] = [];
        let canvasElement: HTMLElement | null = null;
        let dragStartX = 0;
        let dragStartY = 0;
        let isDragging = false;
        let cameraRotX = 0;
        let cameraRotY = 0;
        let targetCameraRotX = 0;
        let targetCameraRotY = 0;
        let cameraZoom = 0;
        let targetZoom = 0;
        
        // Setup canvas
        p.setup = () => {
          console.log("P5 setup running - creating canvas for 3D leaves scene...");
          
          // Create canvas with dimensions matched to container
          const canvas = p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
          p.pixelDensity(1); // For better performance
          
          // Debug - confirm canvas creation
          canvasElement = document.querySelector('canvas.p5Canvas');
          if (canvasElement) {
            console.log("Canvas successfully created for 3D leaves scene:", canvasElement);
            canvasCreatedRef.current = true;
            
            // Apply additional styles directly to ensure visibility
            canvasElement.style.display = 'block';
            canvasElement.style.position = 'fixed';
            canvasElement.style.top = '0';
            canvasElement.style.left = '0';
            canvasElement.style.width = '100%';
            canvasElement.style.height = '100%';
            canvasElement.style.zIndex = '-1';
            canvasElement.style.pointerEvents = 'auto'; // Allow interaction
          } else {
            console.error("Failed to find canvas element after creation!");
          }
          
          p.colorMode(p.HSB, 360, 100, 100, 255);
          p.frameRate(30);
          
          // Create leaves
          for (let i = 0; i < 100; i++) {
            leaves.push(new DetailedLeaf());
          }
          
          // Add mouse and touch event handlers
          canvas.mousePressed(() => {
            dragStartX = p.mouseX;
            dragStartY = p.mouseY;
            isDragging = true;
          });
          
          canvas.mouseReleased(() => {
            isDragging = false;
          });
          
          canvas.mouseWheel((event: any) => {
            targetZoom -= event.delta * 0.01;
            targetZoom = p.constrain(targetZoom, -200, 200);
            return false; // Prevent default scrolling
          });
          
          canvas.touchStarted(() => {
            if (p.touches.length === 1) {
              dragStartX = p.touches[0].x;
              dragStartY = p.touches[0].y;
              isDragging = true;
            }
            return false;
          });
          
          canvas.touchMoved(() => {
            if (isDragging && p.touches.length === 1) {
              const dx = p.touches[0].x - dragStartX;
              const dy = p.touches[0].y - dragStartY;
              targetCameraRotY += dx * 0.01;
              targetCameraRotX += dy * 0.01;
              dragStartX = p.touches[0].x;
              dragStartY = p.touches[0].y;
            }
            return false;
          });
          
          canvas.touchEnded(() => {
            isDragging = false;
            return false;
          });
          
          // Debug log
          console.log("3D leaves scene setup complete. Leaves created:", leaves.length);
        };

        // Resize handler
        p.windowResized = () => {
          console.log("Window resized. Updating canvas dimensions for 3D leaves scene.");
          p.resizeCanvas(window.innerWidth, window.innerHeight);
          
          // Re-check canvas element after resize
          if (!canvasElement) {
            canvasElement = document.querySelector('canvas.p5Canvas');
            if (canvasElement) {
              console.log("Canvas found after resize:", canvasElement);
            }
          }
        };

        // Main draw loop
        p.draw = () => {
          if (!canvasCreatedRef.current) {
            console.log("Canvas not yet created for 3D leaves scene, skipping draw");
            return;
          }
          
          // Clear background
          p.clear();
          p.background(210, 20, 95, 200); // Light blue-ish background with transparency
          
          // Get current scroll position
          const currentScrollY = scrollYRef.current;
          
          // Handle camera controls
          if (isDragging) {
            const dx = p.mouseX - dragStartX;
            const dy = p.mouseY - dragStartY;
            targetCameraRotY += dx * 0.01;
            targetCameraRotX += dy * 0.01;
            dragStartX = p.mouseX;
            dragStartY = p.mouseY;
          }
          
          // Smooth camera movement
          cameraRotX = p.lerp(cameraRotX, targetCameraRotX, 0.1);
          cameraRotY = p.lerp(cameraRotY, targetCameraRotY, 0.1);
          cameraZoom = p.lerp(cameraZoom, targetZoom, 0.1);
          
          // Setup lighting
          p.ambientLight(180, 10, 60); // Soft ambient light
          p.directionalLight(70, 20, 90, 0.5, 1, -0.5); // Main light, slightly yellowish
          p.directionalLight(210, 10, 70, -0.5, -0.5, -0.5); // Secondary light, slightly bluish
          
          // Main scene transformations
          p.push();
          
          // Apply camera transformations
          p.translate(0, 0, cameraZoom);
          p.rotateX(cameraRotX);
          p.rotateY(cameraRotY);
          
          // Small additional rotation for more lively feel
          const t = p.frameCount * 0.01;
          p.rotateZ(p.sin(t) * 0.02);
          
          // Adjust global position based on scroll
          const scrollEffect = currentScrollY * 0.1;
          p.translate(0, scrollEffect, 0);
          
          // Update and display all leaves
          for (let leaf of leaves) {
            leaf.update();
            leaf.display();
            
            // Check for mouse interactions - convert mouse from screen to scene coords
            const mouseX = p.map(p.mouseX, 0, p.width, -p.width/2, p.width/2);
            const mouseY = p.map(p.mouseY, 0, p.height, -p.height/2, p.height/2);
            leaf.checkHover(mouseX, mouseY);
          }
          
          p.pop();
        };
      };

      // Create the p5 instance
      console.log("Creating new P5 instance for 3D leaves scene in container:", containerRef.current);
      sketchRef.current = new p5(sketch, containerRef.current);
      
      // Debug check after a moment
      setTimeout(() => {
        console.log("P5 instance created for 3D leaves scene:", sketchRef.current, "Canvas created:", canvasCreatedRef.current);
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
      console.log("Cleaning up P5 instance for 3D leaves scene");
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
      style={{ pointerEvents: 'auto' }} // Allow interactions
      data-testid="cyber-background" 
    />
  );
};

export default CyberBackground;
