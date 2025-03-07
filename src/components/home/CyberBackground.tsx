
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
      let hue = 120; // Starting with green hue
      let canvasWidth = window.innerWidth;
      let canvasHeight = window.innerHeight;
      let canvasElement: HTMLElement | null = null;
      let mouseInteracting = false;
      let glowIntensity = 0;
      
      // Setup canvas
      p.setup = () => {
        debug(`Creating canvas: ${canvasWidth}x${canvasHeight}`);
        const canvas = p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
        p.colorMode(p.HSB, 360, 100, 100, 1);
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
      };

      // Resize handler
      p.windowResized = () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        debug(`Resizing canvas: ${canvasWidth}x${canvasHeight}`);
        p.resizeCanvas(canvasWidth, canvasHeight);
      };

      // Mouse event handlers for interaction
      p.mousePressed = () => {
        const distToCenter = p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2);
        if (distToCenter < p.width/3) {
          mouseInteracting = true;
          // Trigger glow effect
          glowIntensity = 1;
        }
      };

      p.mouseReleased = () => {
        mouseInteracting = false;
      };

      // Main draw loop
      p.draw = () => {
        p.clear();
        
        // Subtle green background
        p.background(120, 10, 10, 0.05);
        
        // Enhanced lighting for better visibility
        const mainLight = p.color(120, 80, 90); // Bright green
        const accentLight = p.color(150, 70, 90); // Teal/green
        p.pointLight(mainLight, 0, -300, 300);
        p.pointLight(accentLight, 0, 300, -300);
        p.ambientLight(30, 20, 50); // Increased ambient light
        
        // Handle mouse interaction
        const mouseYRotation = p.map(p.mouseX, 0, p.width, -0.1, 0.1);
        const mouseXRotation = p.map(p.mouseY, 0, p.height, -0.1, 0.1);
        
        // Use mouse for rotation if mouse is near center of the screen
        const distFromCenter = p.dist(p.mouseX, p.mouseY, p.width/2, p.height/2);
        const isMouseActive = distFromCenter < p.width/3;
        
        // Create main transformations
        p.push();
        
        // Center and scale based on screen size
        const scale = Math.min(p.width, p.height) / 700; // Responsive scaling
        p.scale(scale * 1.7); // Increased scale for better visibility
        
        p.translate(0, 0, 0);
        p.rotateY(angle * 0.4);
        p.rotateX(angle * 0.2);
        
        // Apply mouse-based rotation if mouse is active
        if (isMouseActive) {
          p.rotateX(mouseXRotation * 2);
          p.rotateY(mouseYRotation * 2);
        }
        
        // Create the abstract shape with improved opacity
        drawEnhancedGreenShape(p, angle);
        
        p.pop();
        
        // Update animation values
        angle += 0.01;
        
        // Cycle through green hues (100-150)
        hue = 120 + 15 * p.sin(angle * 0.5);
        
        // Gradually reduce glow intensity
        if (glowIntensity > 0) {
          glowIntensity -= 0.02;
        }
      };
      
      // Function to draw our enhanced green shape
      const drawEnhancedGreenShape = (p: p5, angle: number) => {
        // Create a series of shapes that form together
        const baseSize = Math.min(p.width, p.height) * 0.22; // Increased size
        
        // Outer glow effect (when interacted with)
        if (glowIntensity > 0) {
          p.push();
          p.fill(120, 90, 90, glowIntensity * 0.4);
          p.sphere(baseSize * 1.5 * (1 + glowIntensity * 0.2));
          p.pop();
        }
        
        // Inner core - pulsing effect
        p.push();
        const pulseAmount = p.sin(angle * 2) * 0.1 + 0.9;
        p.fill(120, 90, 90, 0.9); // Bright green, increased opacity
        p.scale(pulseAmount * 0.7);
        p.rotateX(angle * 0.7);
        p.rotateY(angle * 0.6);
        p.torus(baseSize * 0.6, baseSize * 0.12);
        p.pop();
        
        // Middle layer - green morphing core
        p.push();
        p.fill(hue, 85, 85, 0.9); // Dynamic green, increased opacity
        p.rotateX(angle * -0.5);
        p.rotateZ(angle * 0.3);
        const morphSize = p.sin(angle) * 0.15 + 1;
        p.scale(0.8 * morphSize);
        leafShape(p, baseSize);
        p.pop();
        
        // Outer layer with forest green glow
        p.push();
        p.fill(140, 85, 75, 0.7); // Forest green, increased opacity
        p.rotateY(angle * -0.2);
        p.rotateZ(angle * -0.1);
        p.scale(1.3);
        p.torus(baseSize * 0.8, baseSize * 0.08);
        p.pop();
        
        // Create orbiting smaller elements resembling leaf particles
        for (let i = 0; i < 7; i++) { // Added more elements
          p.push();
          const orbitAngle = angle + (i * p.TWO_PI / 7);
          const orbitRadius = baseSize * 1.7;
          const x = p.sin(orbitAngle) * orbitRadius;
          const y = p.cos(orbitAngle) * orbitRadius * 0.5;
          const z = p.sin(orbitAngle * 2) * orbitRadius * 0.3;
          
          p.translate(x, y, z);
          p.rotateX(angle * (i % 3));
          p.rotateY(angle * (i % 2));
          
          const particleHue = 100 + (i * 10); // Varying shades of green
          p.fill(particleHue, 90, 90, 0.85); // Brighter, increased opacity
          
          // Small leaf-like shape
          if (i % 2 === 0) {
            miniLeaf(p, baseSize * 0.18);
          } else {
            p.sphere(baseSize * 0.12);
          }
          p.pop();
        }
      };
      
      // Custom organic leaf-like shape
      const leafShape = (p: p5, size: number) => {
        p.beginShape();
        for (let i = 0; i < 36; i++) {
          const ang = p.map(i, 0, 36, 0, p.TWO_PI);
          const leafFactor = p.pow(p.sin(ang * 3), 2) * 0.3 + 0.7; // Leaf-like shape factor
          const rad = size * leafFactor * (0.7 + p.sin(ang * 5 + angle) * 0.1);
          const x = rad * p.cos(ang);
          const y = rad * p.sin(ang);
          const z = size * 0.25 * p.sin(ang * 4 + angle * 2);
          p.vertex(x, y, z);
        }
        p.endShape(p.CLOSE);
      };
      
      // Mini leaf shape for particles
      const miniLeaf = (p: p5, size: number) => {
        p.beginShape();
        for (let i = 0; i < 12; i++) {
          const ang = p.map(i, 0, 12, 0, p.TWO_PI);
          const rad = size * (1 + p.sin(ang * 2) * 0.5);
          const x = rad * p.cos(ang);
          const y = rad * p.sin(ang);
          p.vertex(x, y, 0);
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
