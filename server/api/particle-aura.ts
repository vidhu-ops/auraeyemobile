import { Canvas, Image } from 'canvas';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result![1], 16),
    g: parseInt(result![2], 16),
    b: parseInt(result![3], 16),
  };
}

const colorToHex: { [key: string]: string } = {
  'Red': '#FF6B6B',
  'Orange': '#FFA500',
  'Yellow': '#FFD700',
  'Green': '#6BB66B',
  'Blue': '#4A90E2',
  'Indigo': '#4B0082',
  'Violet': '#EE82EE',
  'White': '#FFFFFF',
  'Brown': '#8B4513',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Black': '#000000',
  'Pink': '#FF69B4',
};

export async function generateParticleAuraEffect(
  imageBuffer: Buffer,
  dominantColor: string
): Promise<Buffer> {
  try {
    const img = new Image();
    img.src = imageBuffer;
    
    // Create canvas with same dimensions as image
    const canvas = new Canvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Get color hex and convert to RGB
    const colorHex = colorToHex[dominantColor] || '#4A90E2';
    const color = hexToRgb(colorHex);
    
    // Face detection heuristic - assume face is in upper-middle area
    const faceX = img.width / 2;
    const faceY = img.height * 0.35;
    const faceRadius = Math.min(img.width, img.height) * 0.2;
    
    // Generate particles around face
    const particleCount = 200;
    const particles: Array<{ x: number; y: number; size: number; opacity: number; offset: number }> = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = faceRadius + Math.random() * (faceRadius * 0.8);
      const x = faceX + Math.cos(angle) * distance;
      const y = faceY + Math.sin(angle) * distance;
      const size = Math.random() * 40 + 10;
      const opacity = Math.random() * 0.6 + 0.2;
      
      particles.push({ x, y, size, opacity, offset: Math.random() });
    }
    
    // Draw particles with cloud/smoke effect
    particles.forEach((particle) => {
      // Create gradient for smoky effect
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size
      );
      
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.opacity})`);
      gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add glow effect around face
    const glowGradient = ctx.createRadialGradient(
      faceX,
      faceY,
      faceRadius,
      faceX,
      faceY,
      faceRadius * 1.5
    );
    
    glowGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
    glowGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(faceX, faceY, faceRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Return canvas as PNG buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating particle aura effect:', error);
    // Return original buffer if effect generation fails
    return imageBuffer;
  }
}
