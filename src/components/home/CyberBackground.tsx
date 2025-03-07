
import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

interface CyberBackgroundProps {
  className?: string;
}

const CyberBackground: React.FC<CyberBackgroundProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<p5 | null>(null);
  const [canvasCreated, setCanvasCreated] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string>('');

  // Helper to log debug messages
  const debug = (message: string) => {
    console.log(`CyberBackground: ${message}`);
    setDebugMessage(prev => `${prev}\n${message}`);
  };

  useEffect(() => {
    // Only create the sketch once
    if (!containerRef.current) {
      debug('Container ref not available');
      return;
    }

    if (sketchRef.current) {
      debug('Sketch already exists, removing');
      sketchRef.current.remove();
      sketchRef.current = null;
    }

    debug('Initializing sketch');
    
    // Clear container before creating new canvas
    if (containerRef.current.childNodes.length > 0) {
      debug(`Container has ${containerRef.current.childNodes.length} children, clearing`);
      containerRef.current.innerHTML = '';
    }

    const sketch = (p: p5) => {
      let angle = 0;
      let hue = 0;
      let canvasWidth = window.innerWidth;
      let canvasHeight = window.innerHeight;
      let canvasElement: HTMLElement | null = null;
      let lights: Light[] = [];
      let birds: Bird[] = [];
      let mouseInteractive = false;
      
      class Light {
        x: number;
        y: number;
        size: number;
        alpha: number;
        hue: number;
        pulse: number;
        pulseSpeed: number;

        constructor() {
          this.x = p.random(canvasWidth);
          this.y = p.random(canvasHeight);
          this.size = p.random(50, 150);
          this.alpha = p.random(10, 40);
          this.hue = p.random(60, 140); // Green hues
          this.pulse = 0;
          this.pulseSpeed = p.random(0.02, 0.05);
        }

        update(mouseX: number, mouseY: number) {
          this.pulse += this.pulseSpeed;
          
          // Add mouse interactivity - lights grow when mouse is near
          const distToMouse = p.dist(this.x, this.y, mouseX, mouseY);
          const interactionRadius = 300;
          
          if (distToMouse < interactionRadius) {
            const influence = p.map(distToMouse, 0, interactionRadius, 1.5, 1);
            this.size = p.lerp(this.size, this.size * influence, 0.1);
            this.alpha = p.lerp(this.alpha, this.alpha * 1.2, 0.1);
          }
        }

        display() {
          const pulseFactor = p.sin(this.pulse) * 0.3 + 0.7;
          const size = this.size * pulseFactor;
          
          p.noStroke();
          
          // Glow effect with multiple layers
          for (let i = 3; i > 0; i--) {
            const layerSize = size * (i / 3);
            const layerAlpha = this.alpha * (i / 3);
            p.fill(this.hue, 80, 80, layerAlpha);
            p.ellipse(this.x, this.y, layerSize, layerSize);
          }
        }
      }
      
      class Bird {
        x: number;
        y: number;
        z: number;
        speed: number;
        size: number;
        wingAngle: number;
        wingSpeed: number;
        hue: number;
        
        constructor() {
          this.z = p.random(0.1, 1); // Z-depth for parallax
          this.x = p.random(canvasWidth);
          this.y = p.random(canvasHeight * 0.7); // Higher up in the canvas
          this.speed = p.map(this.z, 0.1, 1, 0.5, 2);
          this.size = p.map(this.z, 0.1, 1, 5, 15);
          this.wingAngle = 0;
          this.wingSpeed = p.random(0.1, 0.3);
          this.hue = p.random(60, 140); // Green hues
        }
        
        update() {
          this.x += this.speed;
          this.wingAngle += this.wingSpeed;
          
          // Reset position when bird leaves the screen
          if (this.x > canvasWidth + 50) {
            this.x = -50;
            this.y = p.random(canvasHeight * 0.7);
          }
        }
        
        display() {
          p.push();
          p.translate(this.x, this.y);
          
          // Bird body color
          p.fill(this.hue, 70, 90, 0.7);
          p.noStroke();
          
          // Bird body
          p.ellipse(0, 0, this.size * 2, this.size);
          
          // Wings
          const wingY = p.sin(this.wingAngle) * this.size * 0.8;
          
          // Left wing
          p.beginShape();
          p.vertex(0, 0);
          p.vertex(-this.size * 1.5, wingY);
          p.vertex(-this.size * 0.5, wingY * 0.5);
          p.endShape(p.CLOSE);
          
          // Right wing
          p.beginShape();
          p.vertex(0, 0);
          p.vertex(this.size * 1.5, wingY);
          p.vertex(this.size * 0.5, wingY * 0.5);
          p.endShape(p.CLOSE);
          
          // Bird head
          p.ellipse(this.size, 0, this.size * 0.8, this.size * 0.8);
          
          p.pop();
        }
      }
      
      // Setup canvas
      p.setup = () => {
        debug(`Creating canvas: ${canvasWidth}x${canvasHeight}`);
        const canvas = p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
        p.colorMode(p.HSB, 100);
        p.noStroke();
        p.frameRate(30);
        
        // Get canvas element to apply styles
        canvasElement = document.getElementById('defaultCanvas0');
        if (canvasElement) {
          debug('Canvas element found, applying styles');
          canvasElement.style.position = 'absolute';
          canvasElement.style.top = '0';
          canvasElement.style.left = '0';
          canvasElement.style.width = '100%';
          canvasElement.style.height = '100%';
          canvasElement.style.zIndex = '-5';
          canvasElement.classList.add('p5Canvas');
          setCanvasCreated(true);
        } else {
          debug('Canvas element not found after creation');
        }
        
        // Initialize lights
        for (let i = 0; i < 15; i++) {
          lights.push(new Light());
        }
        
        // Initialize birds
        for (let i = 0; i < 12; i++) {
          birds.push(new Bird());
        }
      };

      // Resize handler
      p.windowResized = () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        debug(`Resizing canvas: ${canvasWidth}x${canvasHeight}`);
        p.resizeCanvas(canvasWidth, canvasHeight);
      };

      // Main draw loop
      p.draw = () => {
        p.clear();
        
        // Dynamic background color (very subtle)
        p.background(240, 10, 10, 0.05);
        
        // Place back in normal 2D mode for drawing birds and lights
        p.push();
        p.translate(-p.width/2, -p.height/2, 0);
        
        // Draw lights
        for (const light of lights) {
          light.update(p.mouseX, p.mouseY);
          light.display();
        }
        
        // Draw birds
        for (const bird of birds) {
          bird.update();
          bird.display();
        }
        p.pop();
        
        // Enhanced lighting for better visibility
        const pointLight = p.color(60, 80, 100); // Blue
        const pointLight2 = p.color(90, 80, 100); // Purple
        p.pointLight(pointLight, 0, -300, 300);
        p.pointLight(pointLight2, 0, 300, -300);
        p.ambientLight(20, 20, 40); // Increased ambient light
        
        // Handle mouse interaction
        const mouseYRotation = p.map(p.mouseX, 0, p.width, -0.1, 0.1);
        const mouseXRotation = p.map(p.mouseY, 0, p.height, -0.1, 0.1);
        
        // Use mouse for rotation if mouse is near center of the screen
        const distFromCenter = p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2);
        const isMouseActive = distFromCenter < p.width/3;
        
        // Create main transformations
        p.push();
        
        // Center and scale based on screen size
        const scale = Math.min(p.width, p.height) / 800; // Responsive scaling
        p.scale(scale * 1.5); // Increased scale for better visibility
        
        p.translate(0, 0, 0);
        p.rotateY(angle * 0.5);
        p.rotateX(angle * 0.3);
        
        // Apply mouse-based rotation if mouse is active
        if (isMouseActive) {
          p.rotateX(mouseXRotation);
          p.rotateY(mouseYRotation);
        }
        
        // Create the abstract shape with improved opacity
        drawAbstractShape(p, angle);
        
        p.pop();
        
        // Update animation values
        angle += 0.01;
        hue = (hue + 0.1) % 100;
      };

      p.mouseMoved = () => {
        mouseInteractive = true;
      };
      
      // Function to draw our abstract cyberpunk shape
      const drawAbstractShape = (p: p5, angle: number) => {
        // Create a series of shapes that form together
        const baseSize = Math.min(p.width, p.height) * 0.20; // Increased size
        
        // Inner core - pulsing effect
        p.push();
        const pulseAmount = p.sin(angle * 2) * 0.1 + 0.9;
        p.fill(280, 70, 90, 0.9); // Increased opacity
        p.scale(pulseAmount * 0.6);
        p.rotateX(angle * 0.7);
        p.rotateY(angle * 0.6);
        p.torus(baseSize * 0.5, baseSize * 0.1);
        p.pop();
        
        // Middle layer
        p.push();
        p.fill(220, 80, 90, 0.9); // Increased opacity
        p.rotateX(angle * -0.5);
        p.rotateZ(angle * 0.3);
        const morphSize = p.sin(angle) * 0.1 + 1;
        p.scale(0.8 * morphSize);
        customShape(p, baseSize);
        p.pop();
        
        // Outer layer with glow effect
        p.push();
        p.fill(200, 80, 80, 0.6); // Increased opacity
        p.rotateY(angle * -0.2);
        p.rotateZ(angle * -0.1);
        p.scale(1.2);
        p.torus(baseSize * 0.8, baseSize * 0.1);
        p.pop();
        
        // Create orbiting smaller elements
        for (let i = 0; i < 5; i++) { // Added more elements
          p.push();
          const orbitAngle = angle + (i * p.TWO_PI / 5);
          const orbitRadius = baseSize * 1.5;
          const x = p.sin(orbitAngle) * orbitRadius;
          const y = p.cos(orbitAngle) * orbitRadius * 0.5;
          
          p.translate(x, y, 0);
          p.fill(280 + i*15, 90, 90, 0.8); // Increased opacity
          p.sphere(baseSize * 0.15); // Increased size
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
    try {
      debug('Creating p5 instance');
      sketchRef.current = new p5(sketch, containerRef.current);
    } catch (err) {
      debug(`Error creating p5 instance: ${err}`);
    }

    // Additional check to ensure canvas is created
    const checkCanvasTimeout = setTimeout(() => {
      const canvas = document.getElementById('defaultCanvas0');
      if (!canvas && containerRef.current) {
        debug('Canvas not created after timeout, attempting to recreate');
        // Try to recreate sketch if canvas wasn't created
        if (sketchRef.current) {
          sketchRef.current.remove();
          sketchRef.current = null;
        }
        sketchRef.current = new p5(sketch, containerRef.current);
      } else if (canvas) {
        debug('Canvas successfully created and found after timeout');
      }
    }, 1000);

    // Cleanup function
    return () => {
      clearTimeout(checkCanvasTimeout);
      if (sketchRef.current) {
        debug('Removing sketch');
        sketchRef.current.remove();
        sketchRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div 
        ref={containerRef} 
        className={`fixed top-0 left-0 w-full h-full overflow-hidden ${className || ''}`}
        style={{ zIndex: -10 }}
      />
      {debugMessage && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 bg-black/70 text-white p-2 text-xs z-50 max-w-xs max-h-32 overflow-auto">
          <pre>{debugMessage}</pre>
        </div>
      )}
    </>
  );
};

export default CyberBackground;
