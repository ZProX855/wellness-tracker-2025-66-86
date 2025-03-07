
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
        
        // Enhanced lighting for better visibility of rounded shapes
        const blueLight = p.color(60, 80, 100); // Blue
        const purpleLight = p.color(90, 80, 100); // Purple
        const pinkLight = p.color(320, 80, 100); // Pink
        
        p.pointLight(blueLight, 200, -300, 300);
        p.pointLight(purpleLight, -200, 300, -300);
        p.pointLight(pinkLight, 0, 0, 500);
        p.ambientLight(25, 25, 45); // Increased ambient light for better shape visibility
        
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
        
        // Draw all the rounded shapes
        drawRoundedShapes(p, angle);
        
        p.pop();
        
        // Update animation values
        angle += 0.01;
      };
      
      // Function to draw our collection of rounded 3D shapes
      const drawRoundedShapes = (p: p5, angle: number) => {
        const baseSize = Math.min(p.width, p.height) * 0.20;
        
        // Main central sphere with pulsing effect
        p.push();
        const pulseAmount = p.sin(angle * 2) * 0.1 + 0.9;
        p.fill(280, 70, 90, 0.8);
        p.sphere(baseSize * 0.25 * pulseAmount);
        p.pop();
        
        // Large torus rotating around the center
        p.push();
        p.fill(220, 80, 90, 0.7);
        p.rotateX(angle * 0.5);
        p.rotateY(angle * 0.3);
        p.torus(baseSize * 0.8, baseSize * 0.1);
        p.pop();
        
        // Second torus at different angle
        p.push();
        p.fill(180, 70, 85, 0.6);
        p.rotateX(angle * -0.3);
        p.rotateZ(angle * 0.4);
        p.torus(baseSize * 0.6, baseSize * 0.08);
        p.pop();
        
        // Third torus at different angle
        p.push();
        p.fill(320, 60, 95, 0.5);
        p.rotateY(angle * -0.2);
        p.rotateZ(angle * -0.5);
        p.torus(baseSize * 1.0, baseSize * 0.05);
        p.pop();
        
        // Create orbiting spheres
        const numSpheres = 12; // More orbiting spheres
        for (let i = 0; i < numSpheres; i++) {
          p.push();
          // Create different orbital paths
          const orbitAngle = angle + (i * p.TWO_PI / numSpheres);
          const orbitRadius = baseSize * 1.2;
          
          // Calculate position using sine and cosine for smooth circular motion
          // Adding variation to create more dynamic, non-overlapping paths
          const pathVariation = i % 3; // Creates 3 different orbital planes
          
          let x, y, z;
          if (pathVariation === 0) {
            // Horizontal orbit
            x = p.sin(orbitAngle) * orbitRadius;
            y = p.cos(orbitAngle) * orbitRadius * 0.3;
            z = 0;
          } else if (pathVariation === 1) {
            // Vertical orbit
            x = p.sin(orbitAngle) * orbitRadius * 0.5;
            y = 0;
            z = p.cos(orbitAngle) * orbitRadius * 0.8;
          } else {
            // Diagonal orbit
            x = p.sin(orbitAngle) * orbitRadius * 0.7;
            y = p.cos(orbitAngle) * orbitRadius * 0.7;
            z = p.sin(orbitAngle * 2) * orbitRadius * 0.3;
          }
          
          p.translate(x, y, z);
          
          // Size variation based on position
          const sphereSize = baseSize * (0.07 + p.sin(orbitAngle * 3) * 0.03);
          
          // Color variation
          const hue = (260 + i * 10) % 360;
          p.fill(hue, 80, 95, 0.8);
          
          // Draw the sphere
          p.sphere(sphereSize);
          p.pop();
        }
        
        // Add some medium-sized spheres in the middle distance
        for (let i = 0; i < 5; i++) {
          p.push();
          const medAngle = angle * 0.7 + (i * p.TWO_PI / 5);
          const medRadius = baseSize * 0.6;
          const medX = p.sin(medAngle) * medRadius;
          const medY = p.cos(medAngle) * medRadius;
          const medZ = p.sin(medAngle * 1.5) * medRadius * 0.5;
          
          p.translate(medX, medY, medZ);
          p.fill(200 + i * 30, 70, 85, 0.7);
          p.sphere(baseSize * 0.12);
          p.pop();
        }
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
