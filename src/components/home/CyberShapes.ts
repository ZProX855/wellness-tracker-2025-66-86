
import p5 from 'p5';

// Draw collection of rounded 3D shapes
export const drawRoundedShapes = (
  p: p5, 
  angle: number, 
  glowIntensity: number, 
  mouseX: number, 
  mouseY: number
) => {
  const baseSize = Math.min(p.width, p.height) * 0.25; // Increased from 0.20 to 0.25
  
  // Main central sphere with smooth pulsing effect
  p.push();
  const pulseAmount = p.sin(angle * 0.5) * 0.1 + 0.9;
  // Pale green color with glow - reduced opacity to 0.6
  p.fill(120, 40 + (glowIntensity * 20), 90, 0.6);
  p.sphere(baseSize * 0.3 * pulseAmount); // Increased from 0.25 to 0.3
  p.pop();
  
  // Large torus rotating around the center
  p.push();
  p.fill(140, 50 + (glowIntensity * 10), 90, 0.5); // Reduced opacity
  p.rotateX(angle * 0.2);
  p.rotateY(angle * 0.15);
  p.torus(baseSize * 0.9, baseSize * 0.12); // Increased from 0.8/0.1 to 0.9/0.12
  p.pop();
  
  // Second torus at different angle
  p.push();
  p.fill(110, 45 + (glowIntensity * 15), 85, 0.4); // Reduced opacity
  p.rotateX(angle * -0.15);
  p.rotateZ(angle * 0.18);
  p.torus(baseSize * 0.7, baseSize * 0.1); // Increased from 0.6/0.08 to 0.7/0.1
  p.pop();
  
  // Third torus at different angle
  p.push();
  p.fill(130, 35 + (glowIntensity * 20), 95, 0.3); // Reduced opacity
  p.rotateY(angle * -0.1);
  p.rotateZ(angle * -0.2);
  p.torus(baseSize * 1.1, baseSize * 0.06); // Increased from 1.0/0.05 to 1.1/0.06
  p.pop();
  
  // Create orbiting spheres with slight animation
  const numSpheres = 12; // Orbital spheres
  for (let i = 0; i < numSpheres; i++) {
    p.push();
    // Create different orbital paths
    const orbitAngle = angle * 0.4 + (i * p.TWO_PI / numSpheres);
    const orbitRadius = baseSize * 1.3; // Increased from 1.2 to 1.3
    
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
      z = p.sin(orbitAngle * 0.8) * orbitRadius * 0.3;
    }
    
    p.translate(x, y, z);
    
    // Size variation based on position and glow
    const sphereSize = baseSize * (0.08 + p.sin(orbitAngle * 1.2) * 0.04); // Increased from 0.07/0.03 to 0.08/0.04
    
    // Color variation with glow effect - using pale green hues - reduced opacity
    const hue = (120 + i * 5) % 360; // Green-based hues
    // Increased saturation and brightness based on glow intensity
    p.fill(hue, 40 + (glowIntensity * 10), 95 + (glowIntensity * 5), 0.5);
    
    // Draw the sphere
    p.sphere(sphereSize);
    p.pop();
  }
  
  // Add some medium-sized spheres in the middle distance
  for (let i = 0; i < 5; i++) {
    p.push();
    const medAngle = angle * 0.3 + (i * p.TWO_PI / 5);
    const medRadius = baseSize * 0.7; // Increased from 0.6 to 0.7
    const medX = p.sin(medAngle) * medRadius;
    const medY = p.cos(medAngle) * medRadius;
    const medZ = p.sin(medAngle * 0.7) * medRadius * 0.5;
    
    p.translate(medX, medY, medZ);
    // Enhanced glow effect with pale green color - reduced opacity
    p.fill(125 + i * 10, 45 + (glowIntensity * 15), 90 + (glowIntensity * 10), 0.5);
    p.sphere(baseSize * 0.15); // Increased from 0.12 to 0.15
    p.pop();
  }
};
