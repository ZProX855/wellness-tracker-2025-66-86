
import p5 from 'p5';

// Draw collection of rounded 3D shapes
export const drawRoundedShapes = (
  p: p5, 
  angle: number, 
  glowIntensity: number, 
  mouseX: number, 
  mouseY: number
) => {
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
