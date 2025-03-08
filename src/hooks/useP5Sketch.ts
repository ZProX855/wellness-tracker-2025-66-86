
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

  const debug = (message: string) => {
    const formattedMessage = createDebugLogger(debugPrefix)(message);
    setDebugMessages(prev => `${prev}\n${formattedMessage}`);
    return formattedMessage;
  };

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
      
      let rotationX = 0;
      let rotationY = 0;
      let rotationZ = 0;
      
      const keys: { [key: string]: boolean } = {
        w: false,
        a: false,
        s: false,
        d: false
      };
      
      p.setup = () => {
        debug(`Creating canvas: ${canvasWidth}x${canvasHeight}`);
        const canvas = p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
        p.colorMode(p.HSB, 100);
        p.noStroke();
        p.frameRate(30);
        
        if (setupCanvasElement('defaultCanvas0')) {
          debug('Canvas element found, applying styles');
          setCanvasCreated(true);
        } else {
          debug('Canvas element not found after creation');
        }
      };

      p.keyPressed = () => {
        const key = p.key.toLowerCase();
        if (key in keys) {
          keys[key] = true;
        }
        return false;
      };
      
      p.keyReleased = () => {
        const key = p.key.toLowerCase();
        if (key in keys) {
          keys[key] = false;
        }
        return false;
      };

      p.windowResized = () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        debug(`Resizing canvas: ${canvasWidth}x${canvasHeight}`);
        p.resizeCanvas(canvasWidth, canvasHeight);
      };

      p.draw = () => {
        p.clear();
        
        // Set background to very transparent (60% opacity overall effect)
        p.background(120, 10, 10, 0.03);
        
        glowIntensity += 0.01 * glowDirection;
        if (glowIntensity > 1) {
          glowIntensity = 1;
          glowDirection = -1;
        } else if (glowIntensity < 0.3) {
          glowIntensity = 0.3;
          glowDirection = 1;
        }
        
        if (keys.w) rotationX -= 0.02;
        if (keys.s) rotationX += 0.02;
        if (keys.a) rotationY -= 0.02;
        if (keys.d) rotationY += 0.02;
        
        // Make lights less intense for more transparency
        const paleGreenLight = p.color(120, 30, 60 * glowIntensity);
        const lightGreenLight = p.color(140, 20, 60 * glowIntensity);
        const softGreenLight = p.color(110, 40, 60 * glowIntensity);
        
        p.pointLight(paleGreenLight, 300 * Math.sin(angle * 0.1), 300 * Math.cos(angle * 0.1), 300);
        p.pointLight(lightGreenLight, -300 * Math.cos(angle * 0.15), -300 * Math.sin(angle * 0.15), -300);
        p.pointLight(softGreenLight, 500 * Math.sin(angle * 0.2), -500 * Math.cos(angle * 0.2), 500 * Math.sin(angle * 0.05));
        
        // Reduced ambient light for more transparency
        p.ambientLight(15 * glowIntensity, 20 * glowIntensity, 15 * glowIntensity);
        
        p.push();
        
        const scale = Math.min(p.width, p.height) / 800;
        p.scale(scale * 2.0);
        
        p.rotateX(rotationX);
        p.rotateY(rotationY);
        
        p.rotateY(angle * 0.1);
        p.rotateX(angle * 0.07);
        p.rotateZ(angle * 0.03);
        
        drawRoundedShapes(p, angle, glowIntensity, 0, 0);
        
        p.pop();
        
        angle += 0.005;
      };
    };

    try {
      debug('Creating p5 instance');
      sketchRef.current = new p5(sketch, containerRef.current);
    } catch (err) {
      debug(`Error creating p5 instance: ${err}`);
    }

    const checkCanvasTimeout = setTimeout(() => {
      const canvas = document.getElementById('defaultCanvas0');
      if (!canvas && containerRef.current) {
        debug('Canvas not created after timeout, attempting to recreate');
        if (sketchRef.current) {
          sketchRef.current.remove();
          sketchRef.current = null;
        }
        sketchRef.current = new p5(sketch, containerRef.current);
      } else if (canvas) {
        debug('Canvas successfully created and found after timeout');
      }
    }, 1000);

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
