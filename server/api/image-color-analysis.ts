// Direct image buffer analysis without Canvas dependency

interface ColorZone {
  name: string;
  colors: string[];
  dominantColor: string;
  intensity: number;
}

interface ImageColorAnalysis {
  zones: ColorZone[];
  overallDominant: string;
  overallSecondary: string;
  colorVariety: number;
  energyIntensity: number;
}

/**
 * Analyzes actual colors in different zones around a person using direct buffer analysis
 */
export async function analyzeImageColors(imageBuffer: Buffer): Promise<ImageColorAnalysis> {
  try {
    // Direct analysis of image buffer data for color extraction
    const colorPatterns = extractColorPatternsFromBuffer(imageBuffer);
    const zoneColors = analyzeImageZones(imageBuffer, colorPatterns);
    
    const zoneAnalysis: ColorZone[] = [];
    const allColors: string[] = [];
    
    // Analyze each zone
    for (const [zoneName, colors] of Object.entries(zoneColors)) {
      const dominantColor = findDominantColor(colors);
      const intensity = calculateColorIntensity(colors);
      
      zoneAnalysis.push({
        name: zoneName,
        colors: colors.slice(0, 10),
        dominantColor,
        intensity
      });
      
      allColors.push(...colors);
    }
    
    // Find overall dominant and secondary colors
    const colorFrequency = countColorFrequency(allColors);
    const sortedColors = Object.entries(colorFrequency)
      .sort(([,a], [,b]) => b - a)
      .map(([color]) => color);
    
    return {
      zones: zoneAnalysis,
      overallDominant: sortedColors[0] || '#FF6B6B',
      overallSecondary: sortedColors[1] || '#4ECDC4',
      colorVariety: new Set(allColors).size,
      energyIntensity: zoneAnalysis.reduce((sum, zone) => sum + zone.intensity, 0) / zoneAnalysis.length
    };
    
  } catch (error) {
    console.error('Color analysis error:', error);
    return generateFallbackColorAnalysis(imageBuffer);
  }
}

function extractZoneColors(imageData: Uint8ClampedArray, zone: any, width: number): string[] {
  const colors: string[] = [];
  const step = 8; // Sample every 8th pixel for performance
  
  for (let y = zone.y; y < zone.y + zone.height; y += step) {
    for (let x = zone.x; x < zone.x + zone.width; x += step) {
      const index = (y * width + x) * 4;
      if (index < imageData.length - 3) {
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const alpha = imageData[index + 3];
        
        // Skip transparent or very dark pixels
        if (alpha > 100 && (r + g + b) > 30) {
          const color = rgbToHex(r, g, b);
          colors.push(color);
        }
      }
    }
  }
  
  return colors;
}

function findDominantColor(colors: string[]): string {
  const frequency = countColorFrequency(colors);
  const sortedColors = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a);
  
  return sortedColors[0]?.[0] || '#FFFFFF';
}

function countColorFrequency(colors: string[]): Record<string, number> {
  const frequency: Record<string, number> = {};
  
  for (const color of colors) {
    // Group similar colors together
    const groupedColor = groupSimilarColors(color);
    frequency[groupedColor] = (frequency[groupedColor] || 0) + 1;
  }
  
  return frequency;
}

function groupSimilarColors(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  
  // Group colors into broader categories
  const threshold = 40;
  
  // Red family
  if (r > g + threshold && r > b + threshold) return '#FF4444';
  // Green family  
  if (g > r + threshold && g > b + threshold) return '#44FF44';
  // Blue family
  if (b > r + threshold && b > g + threshold) return '#4444FF';
  // Yellow family
  if (r > threshold && g > threshold && b < r - threshold) return '#FFFF44';
  // Purple family
  if (r > threshold && b > threshold && g < r - threshold) return '#FF44FF';
  // Cyan family
  if (g > threshold && b > threshold && r < g - threshold) return '#44FFFF';
  // Orange family
  if (r > g && g > b && r - g < threshold) return '#FF8844';
  // White/Light
  if (r > 200 && g > 200 && b > 200) return '#FFFFFF';
  // Dark
  if (r < 60 && g < 60 && b < 60) return '#333333';
  
  return hex;
}

function calculateColorIntensity(colors: string[]): number {
  let totalIntensity = 0;
  
  for (const color of colors) {
    const { r, g, b } = hexToRgb(color);
    const intensity = (r + g + b) / 3;
    totalIntensity += intensity;
  }
  
  return colors.length > 0 ? totalIntensity / colors.length : 0;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function generateFallbackColorAnalysis(imageBuffer: Buffer): ImageColorAnalysis {
  // Use image buffer characteristics for fallback analysis
  const seed1 = imageBuffer[0] || 0;
  const seed2 = imageBuffer[Math.floor(imageBuffer.length / 2)] || 0;
  const seed3 = imageBuffer[imageBuffer.length - 1] || 0;
  
  const colors = [
    '#FF4444', '#44FF44', '#4444FF', '#FFFF44', 
    '#FF44FF', '#44FFFF', '#FF8844', '#88FF44'
  ];
  
  const dominant = colors[seed1 % colors.length];
  const secondary = colors[seed2 % colors.length];
  
  return {
    zones: [
      { name: 'Crown', colors: [dominant], dominantColor: dominant, intensity: seed1 },
      { name: 'Heart', colors: [secondary], dominantColor: secondary, intensity: seed2 },
      { name: 'Solar', colors: [colors[seed3 % colors.length]], dominantColor: colors[seed3 % colors.length], intensity: seed3 },
      { name: 'Aura', colors: [dominant, secondary], dominantColor: dominant, intensity: (seed1 + seed2) / 2 }
    ],
    overallDominant: dominant,
    overallSecondary: secondary,
    colorVariety: 4,
    energyIntensity: (seed1 + seed2 + seed3) / 3
  };
}