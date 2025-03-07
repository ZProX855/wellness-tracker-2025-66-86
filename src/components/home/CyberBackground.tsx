
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
      let glowIntensity = 0;
      let glowDirection = 1; // 1 for increasing, -1 for decreasing
      
      // Mouse tracking variables
      let mouseX = canvasWidth / 2;
      let mouseY = canvasHeight / 2;
      let targetX = canvasWidth / 2;
      let targetY = canvasHeight / 2;
      
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

      // Track mouse movement
      p.mouseMoved = () => {
        targetX = p.mouseX - canvasWidth / 2;
        targetY = p.mouseY - canvasHeight / 2;
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
        
        // Update glow intensity
        glowIntensity += 0.01 * glowDirection;
        if (glowIntensity > 1) {
          glowIntensity = 1;
          glowDirection = -1;
        } else if (glowIntensity < 0.3) {
          glowIntensity = 0.3;
          glowDirection = 1;
        }
        
        // Smooth follow mouse with easing
        mouseX = p.lerp(mouseX, targetX, 0.05); // Slow follow effect
        mouseY = p.lerp(mouseY, targetY, 0.05); // Slow follow effect
        
        // Enhanced lighting with glow effect that follows mouse
        const blueLight = p.color(60, 80, 100 * glowIntensity); // Blue with varying intensity
        const purpleLight = p.color(90, 80, 100 * glowIntensity); // Purple with varying intensity
        const pinkLight = p.color(320, 80, 100 * glowIntensity); // Pink with varying intensity
        
        // Lights that follow the cursor position with offset
        p.pointLight(blueLight, mouseX * 0.8, mouseY * 0.8, 300);
        p.pointLight(purpleLight, -mouseX * 0.6, -mouseY * 0.6, -300);
        p.pointLight(pinkLight, mouseY * 0.5, -mouseX * 0.5, 500 * Math.sin(angle * 0.05));
        
        // Ambient light that changes with glow intensity
        p.ambientLight(25 * glowIntensity, 25 * glowIntensity, 45 * glowIntensity);
        
        // Create main transformations
        p.push();
        
        // Center and scale based on screen size
        const scale = Math.min(p.width, p.height) / 800; // Responsive scaling
        p.scale(scale * 1.5); // Increased scale for better visibility
        
        // Translate scene based on mouse position with dampening
        p.translate(mouseX * 0.1, mouseY * 0.1, 0);
        
        // Slow, constant rotation with slight mouse influence
        p.rotateY(angle * 0.1 + mouseX * 0.0002);
        p.rotateX(angle * 0.07 + mouseY * 0.0002);
        p.rotateZ(angle * 0.03);
        
        // Draw all the rounded shapes with glow effect
        drawRoundedShapes(p, angle, glowIntensity, mouseX, mouseY);
        
        p.pop();
        
        // Update animation values - slower rotation for a more gentle effect
        angle += 0.005;
      };
      
      // Function to draw our collection of rounded 3D shapes
      const drawRoundedShapes = (p: p5, angle: number, glowIntensity: number, mouseX: number, mouseY: number) => {
        const baseSize = Math.min(p.width, p.height) * 0.20;
        
        // Main central sphere with smooth pulsing effect
        p.push();
        const pulseAmount = p.sin(angle * 0.5) * 0.1 + 0.9;
        // More vivid color with glow
        p.fill(280, 70 + (glowIntensity * 20), 90, 0.8);
        p.sphere(baseSize * 0.25 * pulseAmount);
        p.pop();
        
        // Large torus rotating around the center, influenced by mouse
        p.push();
        p.fill(220, 80 + (glowIntensity * 10), 90, 0.7);
        p.rotateX(angle * 0.2 + mouseY * 0.0001);
        p.rotateY(angle * 0.15 + mouseX * 0.0001);
        p.torus(baseSize * 0.8, baseSize * 0.1);
        p.pop();
        
        // Second torus at different angle, influenced by mouse
        p.push();
        p.fill(180, 70 + (glowIntensity * 15), 85, 0.6);
        p.rotateX(angle * -0.15 - mouseY * 0.0001);
        p.rotateZ(angle * 0.18 + mouseX * 0.0001);
        p.torus(baseSize * 0.6, baseSize * 0.08);
        p.pop();
        
        // Third torus at different angle, influenced by mouse
        p.push();
        p.fill(320, 60 + (glowIntensity * 20), 95, 0.5);
        p.rotateY(angle * -0.1 - mouseX * 0.0001);
        p.rotateZ(angle * -0.2 + mouseY * 0.0001);
        p.torus(baseSize * 1.0, baseSize * 0.05);
        p.pop();
        
        // Create orbiting spheres with slight mouse influence
        const numSpheres = 12; // Orbital spheres
        for (let i = 0; i < numSpheres; i++) {
          p.push();
          // Create different orbital paths with mouse influence
          const orbitAngle = angle * 0.4 + (i * p.TWO_PI / numSpheres);
          const orbitRadius = baseSize * 1.2;
          
          // Calculate position using sine and cosine for smooth circular motion
          // Adding variation to create more dynamic, non-overlapping paths
          const pathVariation = i % 3; // Creates 3 different orbital planes
          
          // Add small mouse influence to each orbit
          const mouseInfluence = 0.2;
          const mouseOffsetX = mouseX * 0.001 * mouseInfluence;
          const mouseOffsetY = mouseY * 0.001 * mouseInfluence;
          
          let x, y, z;
          if (pathVariation === 0) {
            // Horizontal orbit with mouse influence
            x = p.sin(orbitAngle + mouseOffsetX) * orbitRadius;
            y = p.cos(orbitAngle + mouseOffsetY) * orbitRadius * 0.3;
            z = mouseOffsetX * orbitRadius * 0.2;
          } else if (pathVariation === 1) {
            // Vertical orbit with mouse influence
            x = p.sin(orbitAngle + mouseOffsetY) * orbitRadius * 0.5;
            y = mouseOffsetY * orbitRadius * 0.2;
            z = p.cos(orbitAngle + mouseOffsetX) * orbitRadius * 0.8;
          } else {
            // Diagonal orbit with mouse influence
            x = p.sin(orbitAngle + mouseOffsetX) * orbitRadius * 0.7;
            y = p.cos(orbitAngle + mouseOffsetY) * orbitRadius * 0.7;
            z = p.sin((orbitAngle + mouseOffsetX) * 0.8) * orbitRadius * 0.3;
          }
          
          p.translate(x, y, z);
          
          // Size variation based on position and glow
          const sphereSize = baseSize * (0.07 + p.sin(orbitAngle * 1.2) * 0.03);
          
          // Color variation with glow effect
          const hue = (260 + i * 10) % 360;
          // Increased saturation and brightness based on glow intensity
          p.fill(hue, 80 + (glowIntensity * 10), 95 + (glowIntensity * 5), 0.8);
          
          // Draw the sphere
          p.sphere(sphereSize);
          p.pop();
        }
        
        // Add some medium-sized spheres in the middle distance with mouse influence
        for (let i = 0; i < 5; i++) {
          p.push();
          const medAngle = angle * 0.3 + (i * p.TWO_PI / 5) + (mouseX + mouseY) * 0.0001;
          const medRadius = baseSize * 0.6;
          const medX = p.sin(medAngle) * medRadius;
          const medY = p.cos(medAngle) * medRadius;
          const medZ = p.sin(medAngle * 0.7) * medRadius * 0.5;
          
          p.translate(medX, medY, medZ);
          // Enhanced glow effect
          p.fill(200 + i * 30, 70 + (glowIntensity * 15), 85 + (glowIntensity * 10), 0.7);
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
