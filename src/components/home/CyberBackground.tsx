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
      let canvasWidth = window.innerWidth;
      let canvasHeight = window.innerHeight;
      let canvasElement: HTMLElement | null = null;
      
      // Prepare circles for animation
      const circleCount = 15;
      const circles: Circle[] = [];
      
      class Circle {
        x: number;
        y: number;
        z: number;
        radius: number;
        speed: number;
        hue: number;
        opacity: number;
        pulseSpeed: number;
        
        constructor() {
          this.x = p.random(-canvasWidth/2, canvasWidth/2);
          this.y = p.random(-canvasHeight/2, canvasHeight/2);
          this.z = p.random(-200, 200);
          this.radius = p.random(20, 120);
          this.speed = p.random(0.005, 0.02);
          this.hue = p.random(110, 150); // Green hues
          this.opacity = p.random(0.1, 0.35);
          this.pulseSpeed = p.random(0.02, 0.05);
        }
        
        update(angle: number, mouseX: number, mouseY: number) {
          // Move circle with angle
          this.z = 200 * p.sin(angle * this.speed + p.frameCount * 0.01);
          
          // Interactive movement based on mouse position
          const mouseDistX = p.map(mouseX, 0, p.width, -10, 10);
          const mouseDistY = p.map(mouseY, 0, p.height, -10, 10);
          
          this.x += mouseDistX * 0.01;
          this.y += mouseDistY * 0.01;
          
          // Keep within bounds
          if (this.x < -canvasWidth) this.x = canvasWidth;
          if (this.x > canvasWidth) this.x = -canvasWidth;
          if (this.y < -canvasHeight) this.y = canvasHeight;
          if (this.y > canvasHeight) this.y = -canvasHeight;
          
          // Pulsing opacity
          this.opacity = p.map(p.sin(p.frameCount * this.pulseSpeed), -1, 1, 0.1, 0.35);
        }
        
        display() {
          p.push();
          p.translate(this.x, this.y, this.z);
          
          // Create green transparent circle
          p.noStroke();
          p.fill(this.hue, 80, 70, this.opacity);
          p.sphere(this.radius);
          
          // Add subtle glow effect
          p.fill(this.hue, 80, 90, this.opacity * 0.4);
          p.sphere(this.radius * 1.2);
          
          p.pop();
        }
      }
      
      // Setup canvas
      p.setup = () => {
        debug(`Creating canvas: ${canvasWidth}x${canvasHeight}`);
        const canvas = p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
        p.colorMode(p.HSB, 360, 100, 100, 1.0);
        p.noStroke();
        p.frameRate(30);
        p.blendMode(p.BLEND);
        
        // Initialize circles
        for (let i = 0; i < circleCount; i++) {
          circles.push(new Circle());
        }
        
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
        
        // Transparent dark background with slight green tint
        p.background(140, 10, 10, 0.05);
        
        // Enhanced lighting for better visibility
        p.ambientLight(140, 20, 70, 0.3); // Soft green ambient light
        p.pointLight(140, 20, 100, 0, 0, 300); // Top light
        p.pointLight(140, 80, 90, p.mouseX - p.width/2, p.mouseY - p.height/2, 200); // Mouse-following light
        
        // Update and display all circles
        for (let i = 0; i < circles.length; i++) {
          circles[i].update(angle, p.mouseX, p.mouseY);
          circles[i].display();
        }
        
        // Add some small floating particles
        p.push();
        for (let i = 0; i < 30; i++) {
          const t = p.frameCount * 0.01 + i;
          const x = p.sin(t) * canvasWidth * 0.5;
          const y = p.cos(t * 0.8) * canvasHeight * 0.3;
          const z = p.sin(t * 1.2) * 100;
          
          p.push();
          p.translate(x, y, z);
          p.fill(140, 80, 90, 0.2 + 0.1 * p.sin(t * 2));
          p.sphere(3 + 2 * p.sin(t));
          p.pop();
        }
        p.pop();
        
        // Update animation values
        angle += 0.01;
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
