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
  'Red': '#FF4444',
  'Orange': '#FF8C00',
  'Yellow': '#FFD700',
  'Green': '#32CD32',
  'Blue': '#4169E1',
  'Indigo': '#4B0082',
  'Violet': '#EE82EE',
  'White': '#FFFFFF',
  'Brown': '#8B4513',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Black': '#333333',
  'Pink': '#FF69B4',
};

export async function generateParticleAuraEffect(
  imageBuffer: Buffer,
  dominantColor: string
): Promise<Buffer> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 700;
    const height = metadata.height || 500;
    
    const colorHex = colorToHex[dominantColor] || '#32CD32';
    const color = hexToRgb(colorHex);
    
    const faceX = width / 2;
    const faceY = height * 0.38;
    const faceRadius = Math.min(width, height) * 0.22;
    
    const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="heavyBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
        </filter>
        <filter id="mediumBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>
        <filter id="lightBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
        </filter>
        
        <radialGradient id="faceClearZone" cx="50%" cy="38%" r="45%">
          <stop offset="0%" style="stop-color:white;stop-opacity:1" />
          <stop offset="35%" style="stop-color:white;stop-opacity:0.8" />
          <stop offset="60%" style="stop-color:white;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
        
        <radialGradient id="auraGlow" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:rgb(${color.r}, ${color.g}, ${color.b});stop-opacity:0" />
          <stop offset="25%" style="stop-color:rgb(${color.r}, ${color.g}, ${color.b});stop-opacity:0.7" />
          <stop offset="50%" style="stop-color:rgb(${color.r}, ${color.g}, ${color.b});stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:rgb(${color.r}, ${color.g}, ${color.b});stop-opacity:1" />
        </radialGradient>
        
        <mask id="faceMask">
          <rect width="100%" height="100%" fill="white"/>
          <ellipse cx="${faceX}" cy="${faceY}" rx="${faceRadius * 1.3}" ry="${faceRadius * 1.5}" fill="url(#faceClearZone)" />
        </mask>
      </defs>
      
      <rect width="100%" height="100%" fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="0.92" mask="url(#faceMask)" />
      
      <ellipse cx="${width * 0.15}" cy="${height * 0.2}" rx="${width * 0.5}" ry="${height * 0.5}" 
               fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="0.85" filter="url(#heavyBlur)" mask="url(#faceMask)" />
      <ellipse cx="${width * 0.85}" cy="${height * 0.3}" rx="${width * 0.5}" ry="${height * 0.5}" 
               fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="0.85" filter="url(#heavyBlur)" mask="url(#faceMask)" />
      <ellipse cx="${width * 0.5}" cy="${height * 0.9}" rx="${width * 0.7}" ry="${height * 0.5}" 
               fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="0.9" filter="url(#heavyBlur)" mask="url(#faceMask)" />
      
      <ellipse cx="${width * 0.1}" cy="${height * 0.7}" rx="${width * 0.4}" ry="${height * 0.4}" 
               fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="0.8" filter="url(#mediumBlur)" mask="url(#faceMask)" />
      <ellipse cx="${width * 0.9}" cy="${height * 0.8}" rx="${width * 0.4}" ry="${height * 0.4}" 
               fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="0.8" filter="url(#mediumBlur)" mask="url(#faceMask)" />
      
      <ellipse cx="${faceX}" cy="${faceY}" rx="${faceRadius * 2.5}" ry="${faceRadius * 2.5}" 
               fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="0.6" filter="url(#mediumBlur)" mask="url(#faceMask)" />
      
      <ellipse cx="${faceX}" cy="${faceY}" rx="${faceRadius * 1.8}" ry="${faceRadius * 2.0}" 
               fill="white" opacity="0.25" filter="url(#lightBlur)" />
    </svg>`;
    
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgContent),
          blend: 'over'
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
