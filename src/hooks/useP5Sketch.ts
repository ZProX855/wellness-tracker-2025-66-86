import { useRef, useState, useEffect } from 'react';
import p5 from 'p5';
import { createDebugLogger, setupCanvasElement } from '../utils/p5Utils';
import { drawRoundedShapes } from '../components/home/CyberShapes';

interface UseP5SketchOptions {
  containerId: string;
  debugPrefix?: string;
}

export const useP5Sketch = ({ containerId, debugPrefix = 'P5Sketch' }: UseP5SketchOptions) => {
  const sketchRef = useRef<p5 | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasCreated, setCanvasCreated] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string>('');

  // Helper to log debug messages
  const debug = (message: string) => {
    const formattedMessage = createDebugLogger(debugPrefix)(message);
    setDebugMessages(prev => `${prev}\n${formattedMessage}`);
    return formattedMessage;
  };

  // Setup and cleanup the p5 sketch
  useEffect(() => {
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
      
      // Rotation controls
      let rotationX = 0;
      let rotationY = 0;
      let rotationZ = 0;
      
      // Key states
      const keys: { [key: string]: boolean } = {
        w: false,
        a: false,
        s: false,
        d: false
      };
      
      // Setup canvas
      p.setup = () => {
        debug(`Creating canvas: ${canvasWidth}x${canvasHeight}`);
        const canvas = p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
        p.colorMode(p.HSB, 100);
        p.noStroke();
        p.frameRate(30);
        
        // Get canvas element to apply styles
        const canvasId = 'defaultCanvas0';
        if (setupCanvasElement(canvasId)) {
          debug('Canvas element found, applying styles');
          setCanvasCreated(true);
        } else {
          debug('Canvas element not found after creation');
        }
      };

      // Handle key press and release
      p.keyPressed = () => {
        const key = p.key.toLowerCase();
        if (key in keys) {
          keys[key] = true;
        }
        return false; // Prevent default behavior
      };
      
      p.keyReleased = () => {
        const key = p.key.toLowerCase();
        if (key in keys) {
          keys[key] = false;
        }
        return false; // Prevent default behavior
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
        
        // Update rotation based on WASD keys
        if (keys.w) rotationX -= 0.02;
        if (keys.s) rotationX += 0.02;
        if (keys.a) rotationY -= 0.02;
        if (keys.d) rotationY += 0.02;
        
        // Enhanced lighting with glow effect at fixed positions
        const blueLight = p.color(60, 80, 100 * glowIntensity); // Blue with varying intensity
        const purpleLight = p.color(90, 80, 100 * glowIntensity); // Purple with varying intensity
        const pinkLight = p.color(320, 80, 100 * glowIntensity); // Pink with varying intensity
        
        // Fixed position lights with slight animation
        p.pointLight(blueLight, 300 * Math.sin(angle * 0.1), 300 * Math.cos(angle * 0.1), 300);
        p.pointLight(purpleLight, -300 * Math.cos(angle * 0.15), -300 * Math.sin(angle * 0.15), -300);
        p.pointLight(pinkLight, 500 * Math.sin(angle * 0.2), -500 * Math.cos(angle * 0.2), 500 * Math.sin(angle * 0.05));
        
        // Ambient light that changes with glow intensity
        p.ambientLight(25 * glowIntensity, 25 * glowIntensity, 45 * glowIntensity);
        
        // Create main transformations
        p.push();
        
        // Center and scale based on screen size - increased scale for bigger appearance
        const scale = Math.min(p.width, p.height) / 800; // Responsive scaling
        p.scale(scale * 2.0); // Increased scale for better visibility (from 1.5 to 2.0)
        
        // Apply user-controlled rotation
        p.rotateX(rotationX);
        p.rotateY(rotationY);
        
        // Add constant gentle rotation
        p.rotateY(angle * 0.1);
        p.rotateX(angle * 0.07);
        p.rotateZ(angle * 0.03);
        
        // Draw all the rounded shapes with glow effect
        // Pass 0, 0 for mouse position to keep it centered/non-interactive
        drawRoundedShapes(p, angle, glowIntensity, 0, 0);
        
        p.pop();
        
        // Update animation values - slower rotation for a more gentle effect
        angle += 0.005;
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
  }, [debugPrefix]);

  return {
    containerRef,
    canvasCreated,
    debugMessages
  };
};
