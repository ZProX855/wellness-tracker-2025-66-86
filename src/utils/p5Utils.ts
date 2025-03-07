
import p5 from 'p5';

// Helper to log debug messages with component name prefix
export const createDebugLogger = (componentName: string) => {
  return (message: string) => {
    console.log(`${componentName}: ${message}`);
    return message;
  };
};

// Calculate responsive scale based on screen size
export const calculateResponsiveScale = (p: p5) => {
  return Math.min(p.width, p.height) / 800 * 1.5;
};

// Get canvas element and apply styles
export const setupCanvasElement = (canvasId: string) => {
  const canvasElement = document.getElementById(canvasId);
  if (canvasElement) {
    canvasElement.style.position = 'absolute';
    canvasElement.style.top = '0';
    canvasElement.style.left = '0';
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
    canvasElement.style.zIndex = '-5';
    canvasElement.classList.add('p5Canvas');
    return true;
  }
  return false;
};
