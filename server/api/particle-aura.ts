import sharp from 'sharp';

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
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 700;
    const height = metadata.height || 500;
    
    // Get color hex and convert to RGB
    const colorHex = colorToHex[dominantColor] || '#4A90E2';
    const color = hexToRgb(colorHex);
    
    // Create SVG with dense particle effects concentrated around face
    const particleCount = 2200; // Increased density
    const faceX = width / 2;
    const faceY = height * 0.35;
    const faceRadius = Math.min(width, height) * 0.18;
    
    // Generate particle positions with higher concentration around face
    let particleSvg = '';
    let placedParticles = 0;
    const maxAttempts = particleCount * 3;
    let attempts = 0;
    
    while (placedParticles < particleCount && attempts < maxAttempts) {
      // Random position across entire image
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      // Calculate distance from face center
      const distanceFromFace = Math.sqrt(
        Math.pow(x - faceX, 2) + Math.pow(y - faceY, 2)
      );
      
      // Bias particles toward the face area with reduced exclusion
      if (distanceFromFace > faceRadius * 0.9) {
        // Larger particles with blur for softer effect
        const size = Math.random() * 40 + 25; // 25-65px radius for larger, more visible particles
        const opacity = Math.random() * 0.05 + 0.95; // 0.95-1.0 opacity (nearly fully opaque)
        
        particleSvg += `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="${opacity}" filter="url(#particleBlur)" />`;
        placedParticles++;
      }
      
      attempts++;
    }
    
    // Create SVG overlay with glow and particles
    const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
        <filter id="particleBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
        </filter>
        <filter id="shadow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="glow" cx="50%" cy="35%">
          <stop offset="0%" style="stop-color:rgb(${color.r}, ${color.g}, ${color.b});stop-opacity:0.65" />
          <stop offset="100%" style="stop-color:rgb(${color.r}, ${color.g}, ${color.b});stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="${faceX}" cy="${faceY}" r="${faceRadius * 1.8}" fill="url(#glow)" />
      ${particleSvg}
    </svg>`;
    
    // Composite SVG overlay with image using lighten blend mode for better particle visibility
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgContent),
          blend: 'lighten'
        }
      ])
      .png()
      .toBuffer();
    
    return result;
  } catch (error) {
    console.error('Error generating particle aura effect:', error);
    return imageBuffer;
  }
}
