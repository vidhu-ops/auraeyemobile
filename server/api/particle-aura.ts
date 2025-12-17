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
  'Blue': '#4A90D9',
  'Indigo': '#6B5BFF',
  'Violet': '#EE82EE',
  'White': '#E8E8FF',
  'Brown': '#8B6914',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Black': '#333366',
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
    
    const colorHex = colorToHex[dominantColor] || '#4A90D9';
    const color = hexToRgb(colorHex);
    
    const lighterR = Math.min(255, color.r + 60);
    const lighterG = Math.min(255, color.g + 60);
    const lighterB = Math.min(255, color.b + 60);
    
    const darkerR = Math.max(0, color.r - 40);
    const darkerG = Math.max(0, color.g - 40);
    const darkerB = Math.max(0, color.b - 40);

    const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${lighterR}, ${lighterG}, ${lighterB});stop-opacity:1" />
          <stop offset="50%" style="stop-color:rgb(${color.r}, ${color.g}, ${color.b});stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(${darkerR}, ${darkerG}, ${darkerB});stop-opacity:1" />
        </linearGradient>
        
        <radialGradient id="centerGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:rgb(${lighterR}, ${lighterG}, ${lighterB});stop-opacity:0.9" />
          <stop offset="40%" style="stop-color:rgb(${color.r}, ${color.g}, ${color.b});stop-opacity:0.95" />
          <stop offset="100%" style="stop-color:rgb(${darkerR}, ${darkerG}, ${darkerB});stop-opacity:1" />
        </radialGradient>
        
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
          <feColorMatrix type="saturate" values="0" result="mono"/>
          <feBlend in="SourceGraphic" in2="mono" mode="overlay"/>
        </filter>
        
        <filter id="softBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#mainGradient)" />
      <rect width="100%" height="100%" fill="url(#centerGlow)" />
      
      <ellipse cx="${width * 0.2}" cy="${height * 0.3}" rx="${width * 0.4}" ry="${height * 0.4}" 
               fill="rgb(${lighterR}, ${lighterG}, ${lighterB})" opacity="0.4" filter="url(#softBlur)" />
      <ellipse cx="${width * 0.8}" cy="${height * 0.7}" rx="${width * 0.35}" ry="${height * 0.35}" 
               fill="rgb(${darkerR}, ${darkerG}, ${darkerB})" opacity="0.5" filter="url(#softBlur)" />
      <ellipse cx="${width * 0.5}" cy="${height * 0.5}" rx="${width * 0.5}" ry="${height * 0.5}" 
               fill="rgb(${color.r}, ${color.g}, ${color.b})" opacity="0.3" filter="url(#softBlur)" />
    </svg>`;
    
    const result = await sharp(Buffer.from(svgContent))
      .resize(width, height)
      .png()
      .toBuffer();
    
    return result;
  } catch (error) {
    console.error('Error generating aura effect:', error);
    const colorHex = colorToHex[dominantColor] || '#4A90D9';
    const color = hexToRgb(colorHex);
    
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 700;
    const height = metadata.height || 500;
    
    const fallbackSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="rgb(${color.r}, ${color.g}, ${color.b})" />
    </svg>`;
    
    return await sharp(Buffer.from(fallbackSvg)).png().toBuffer();
  }
}
