
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
        // Define classes for elements
        class Tree {
          pos: p5.Vector;
          height: number;
          width: number;
          color: p5.Color;
          glowing: boolean;
          originalColor: p5.Color;
          growthStage: number;
          maxHeight: number;
          swayAngle: number;
          swaySpeed: number;
          leavesCount: number;
          leaves: Leaf[];
          apples: Apple[];
          
          constructor(x: number, y: number, z: number) {
            this.pos = p.createVector(x, y, z);
            this.maxHeight = p.random(150, 250);
            this.height = 0; // Start small, will grow
            this.width = this.maxHeight / 10;
            this.color = p.color(101, 67, 33); // Brown
            this.originalColor = p.color(101, 67, 33);
            this.glowing = false;
            this.growthStage = 0;
            this.swayAngle = 0;
            this.swaySpeed = p.random(0.01, 0.03);
            this.leavesCount = p.floor(p.random(5, 15));
            this.leaves = [];
            this.apples = [];
          }
          
          grow() {
            // Grow the tree to its max height
            if (this.height < this.maxHeight) {
              this.height += (this.maxHeight - this.height) * 0.05;
              this.growthStage = this.height / this.maxHeight;
              
              // Add leaves as the tree grows
              if (this.growthStage > 0.5 && this.leaves.length < this.leavesCount) {
                const leafY = -this.height * (0.3 + p.random(0.3));
                const angle = p.random(p.TWO_PI);
                const radius = p.random(30, 60);
                const x = this.pos.x + p.cos(angle) * radius;
                const z = this.pos.z + p.sin(angle) * radius;
                this.leaves.push(new Leaf(x, leafY, z));
              }
              
              // Add apples when tree is almost fully grown
              if (this.growthStage > 0.8 && p.random() < 0.01 && this.apples.length < 5) {
                const appleY = -this.height * (0.4 + p.random(0.3));
                const angle = p.random(p.TWO_PI);
                const radius = p.random(20, 50);
                const x = this.pos.x + p.cos(angle) * radius;
                const z = this.pos.z + p.sin(angle) * radius;
                this.apples.push(new Apple(x, appleY, z));
              }
            }
          }
          
          checkMouse(mouseX: number, mouseY: number) {
            // Simple distance check for mouse interaction
            const screenX = this.pos.x;
            const screenY = this.pos.y - this.height/2;
            
            const distance = p.dist(mouseX, mouseY, screenX, screenY);
            if (distance < 50) {
              if (!this.glowing) {
                this.glowing = true;
                this.color = p.color(135, 90, 44); // Lighter brown when glowing
                
                // Make leaves glow too
                this.leaves.forEach(leaf => {
                  leaf.glowing = true;
                  leaf.color = p.color(100, 255, 100); 
                });
              }
            } else if (this.glowing) {
              this.glowing = false;
              this.color = this.originalColor;
              
              // Reset leaves
              this.leaves.forEach(leaf => {
                leaf.glowing = false;
                leaf.color = leaf.originalColor;
              });
            }
          }
          
          update() {
            this.grow();
            
            // Gentle swaying motion
            this.swayAngle += this.swaySpeed;
            
            // Update leaves
            this.leaves.forEach(leaf => leaf.update());
            
            // Update apples
            this.apples.forEach(apple => apple.update());
          }
          
          display() {
            p.push();
            p.translate(this.pos.x, this.pos.y, this.pos.z);
            
            // Sway the tree
            p.rotateX(p.sin(this.swayAngle) * 0.05);
            p.rotateZ(p.cos(this.swayAngle) * 0.05);
            
            // Draw trunk
            p.fill(this.color);
            p.noStroke();
            if (this.glowing) {
              p.ambientLight(50, 50, 10);
              p.pointLight(120, 80, 40, 0, -this.height/2, 0);
            }
            
            p.cylinder(this.width, this.height);
            
            p.pop();
            
            // Draw leaves
            this.leaves.forEach(leaf => leaf.display(this.pos.x, this.pos.y, this.pos.z));
            
            // Draw apples
            this.apples.forEach(apple => apple.display(this.pos.x, this.pos.y, this.pos.z));
          }
        }
        
        class Leaf {
          offset: p5.Vector;
          size: number;
          rotX: number;
          rotY: number;
          rotZ: number;
          rotSpeed: number;
          color: p5.Color;
          originalColor: p5.Color;
          glowing: boolean;
          
          constructor(x: number, y: number, z: number) {
            this.offset = p.createVector(x, y, z);
            this.size = p.random(10, 20);
            this.rotX = p.random(p.TWO_PI);
            this.rotY = p.random(p.TWO_PI);
            this.rotZ = p.random(p.TWO_PI);
            this.rotSpeed = p.random(0.01, 0.05);
            
            // Different shades of green for variety
            const green = p.random(100, 150);
            this.color = p.color(30, green, 50);
            this.originalColor = this.color;
            this.glowing = false;
          }
          
          update() {
            // Gentle rotation
            this.rotX += this.rotSpeed * 0.2;
            this.rotY += this.rotSpeed;
            this.rotZ += this.rotSpeed * 0.5;
          }
          
          display(treeX: number, treeY: number, treeZ: number) {
            p.push();
            // Position relative to tree
            p.translate(this.offset.x, this.offset.y, this.offset.z);
            
            // Rotate leaf
            p.rotateX(this.rotX);
            p.rotateY(this.rotY);
            p.rotateZ(this.rotZ);
            
            // Draw leaf
            p.fill(this.color);
            p.noStroke();
            
            if (this.glowing) {
              p.ambientLight(0, 100, 0);
              p.pointLight(50, 255, 50, 0, 0, 0);
            }
            
            // Simple leaf shape
            p.beginShape();
            p.vertex(0, 0, 0); // Stem attachment point
            p.vertex(this.size/2, -this.size/3, 0);
            p.vertex(this.size, 0, 0);
            p.vertex(this.size/2, this.size/3, 0);
            p.endShape(p.CLOSE);
            
            p.pop();
          }
        }
        
        class Apple {
          offset: p5.Vector;
          size: number;
          rotY: number;
          rotSpeed: number;
          color: p5.Color;
          originalColor: p5.Color;
          glowing: boolean;
          floating: boolean;
          floatHeight: number;
          
          constructor(x: number, y: number, z: number) {
            this.offset = p.createVector(x, y, z);
            this.size = p.random(8, 12);
            this.rotY = p.random(p.TWO_PI);
            this.rotSpeed = p.random(0.01, 0.03);
            this.color = p.color(255, 40, 40); // Red apple
            this.originalColor = this.color;
            this.glowing = false;
            this.floating = false;
            this.floatHeight = 0;
          }
          
          update() {
            // Gentle rotation
            this.rotY += this.rotSpeed;
            
            // Handle floating animation if apple is picked
            if (this.floating) {
              this.floatHeight += 0.5;
              this.offset.y -= 0.5;
              
              // Make it glow while floating
              this.glowing = true;
              this.color = p.color(255, 100, 100);
              
              // Disappear when too high
              if (this.floatHeight > 100) {
                this.size = 0;
              }
            }
          }
          
          checkMouse(mouseX: number, mouseY: number) {
            // Convert world position to screen position (simplified)
            const screenX = this.offset.x;
            const screenY = this.offset.y;
            
            const distance = p.dist(mouseX, mouseY, screenX, screenY);
            if (distance < this.size * 2) {
              if (!this.glowing && !this.floating) {
                this.glowing = true;
                this.color = p.color(255, 150, 150); // Lighter red when glowing
                
                // If clicked, make it float away
                if (p.mouseIsPressed) {
                  this.floating = true;
                }
              }
            } else if (this.glowing && !this.floating) {
              this.glowing = false;
              this.color = this.originalColor;
            }
          }
          
          display(treeX: number, treeY: number, treeZ: number) {
            if (this.size <= 0) return; // Skip if disappeared
            
            p.push();
            // Position relative to tree
            p.translate(this.offset.x, this.offset.y, this.offset.z);
            
            // Rotate apple
            p.rotateY(this.rotY);
            
            // Draw apple
            p.fill(this.color);
            p.noStroke();
            
            if (this.glowing) {
              p.ambientLight(50, 20, 20);
              p.pointLight(255, 50, 50, 0, 0, 0);
            }
            
            p.sphere(this.size);
            
            // Add a small stem on top
            p.push();
            p.translate(0, -this.size, 0);
            p.fill(101, 67, 33); // Brown stem
            p.cylinder(1, 5);
            p.pop();
            
            p.pop();
          }
        }
        
        let trees: Tree[] = [];
        let canvasElement: HTMLElement | null = null;
        let mouseWorldX = 0;
        let mouseWorldY = 0;
        
        // Setup canvas
        p.setup = () => {
          console.log("P5 setup running - creating canvas for wellness scene...");
          
          // Create canvas with dimensions matched to container
          const canvas = p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
          
          // Debug - confirm canvas creation
          canvasElement = document.querySelector('canvas.p5Canvas');
          if (canvasElement) {
            console.log("Canvas successfully created for wellness scene:", canvasElement);
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
          
          p.colorMode(p.RGB);
          p.frameRate(30);
          
          // Create trees
          for (let i = 0; i < 5; i++) {
            const x = p.random(-p.width/2, p.width/2);
            const z = p.random(-800, -100); // Place all trees in the "distance"
            trees.push(new Tree(x, 0, z));
          }
          
          // Debug log
          console.log("Wellness scene setup complete. Trees created:", trees.length);
        };

        // Resize handler
        p.windowResized = () => {
          console.log("Window resized. Updating canvas dimensions for wellness scene.");
          p.resizeCanvas(window.innerWidth, window.innerHeight);
          
          // Re-check canvas element after resize
          if (!canvasElement) {
            canvasElement = document.querySelector('canvas.p5Canvas');
            if (canvasElement) {
              console.log("Canvas found after resize:", canvasElement);
            }
          }
        };
        
        // Convert mouse to scene coordinates
        const updateMousePosition = () => {
          // Basic conversion from screen to world coordinates
          mouseWorldX = p.map(p.mouseX, 0, p.width, -p.width/2, p.width/2);
          mouseWorldY = p.map(p.mouseY, 0, p.height, -p.height/2, p.height/2);
        };

        // Main draw loop
        p.draw = () => {
          if (!canvasCreatedRef.current) {
            console.log("Canvas not yet created for wellness scene, skipping draw");
            return;
          }
          
          updateMousePosition();
          
          // Clear background
          p.clear();
          p.background(240, 250, 255, 0.8); // Light sky blue with transparency
          
          // Get current scroll position
          const currentScrollY = scrollYRef.current;
          
          // Adjust camera position based on scroll
          const cameraY = p.map(currentScrollY, 0, 1000, 100, -200);
          
          // Setup lighting
          p.ambientLight(150, 150, 150);
          p.directionalLight(255, 255, 220, 0, 1, -1); // Sunlight
          
          // Add slight mouse-based rotation for interactivity
          const rotX = p.map(p.mouseY, 0, p.height, -0.1, 0.1);
          const rotY = p.map(p.mouseX, 0, p.width, -0.1, 0.1);
          
          // Draw ground
          p.push();
          p.translate(0, 50, -400);
          p.rotateX(p.PI/2);
          p.fill(80, 140, 70); // Green ground
          p.noStroke();
          p.plane(2000, 1500);
          p.pop();
          
          // Main scene transformations
          p.push();
          
          // Apply camera transformations
          p.translate(0, cameraY, 0);
          p.rotateX(rotX);
          p.rotateY(rotY);
          
          // Update and display all trees
          for (let tree of trees) {
            tree.update();
            tree.display();
            tree.checkMouse(mouseWorldX, tree.pos.y - tree.height/2);
            
            // Check for mouse interactions with apples
            tree.apples.forEach(apple => {
              apple.checkMouse(mouseWorldX, mouseWorldY);
            });
          }
          
          // Add some floating particles for atmosphere
          if (p.frameCount % 10 === 0) {
            // Draw some gentle floating particles
            for (let i = 0; i < 5; i++) {
              const x = p.random(-p.width/2, p.width/2);
              const y = p.random(-200, 100);
              const z = p.random(-800, -100);
              
              p.push();
              p.translate(x, y, z);
              p.fill(255, 255, 150, 100); // Soft yellow pollen/light
              p.noStroke();
              p.sphere(p.random(1, 3));
              p.pop();
            }
          }
          
          p.pop();
        };
      };

      // Create the p5 instance
      console.log("Creating new P5 instance for wellness scene in container:", containerRef.current);
      sketchRef.current = new p5(sketch, containerRef.current);
      
      // Debug check after a moment
      setTimeout(() => {
        console.log("P5 instance created for wellness scene:", sketchRef.current, "Canvas created:", canvasCreatedRef.current);
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
      console.log("Cleaning up P5 instance for wellness scene");
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
