import { AuraAnalysisResult } from "../../client/src/lib/openai";

// Remove unused imports since we're using canvas-based processing
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Generates standardized aura visualization with consistent dimensions and zone positioning
 */
export async function generateAuraVisualization(
  originalImageBase64: string, 
  auraAnalysis: any
): Promise<string> {
  try {
    const { createCanvas, loadImage } = await import('canvas');
    
    console.log(`\n=== AURA VISUALIZATION PROCESSING ===`);
    console.log(`Dominant Color: ${auraAnalysis.dominantColor}`);
    console.log(`Secondary Color: ${auraAnalysis.secondaryColor}`);
    console.log(`Processing with standardized dimensions: 600x900px`);
    
    // Calculate input image size for verification
    const base64Data = originalImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const inputSizeKB = (Buffer.byteLength(base64Data, 'base64') / 1024).toFixed(1);
    console.log(`Input image size: ${inputSizeKB}KB (target: ~60KB)`);
    
    // Standardized dimensions as requested: 600px width × 900px height
    const STANDARD_WIDTH = 600;
    const STANDARD_HEIGHT = 900;
    
    // Create canvas with standardized dimensions
    const canvas = createCanvas(STANDARD_WIDTH, STANDARD_HEIGHT);
    const ctx = canvas.getContext('2d');
    
    // Load and process the original image
    const imageData = originalImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const imgBuffer = Buffer.from(imageData, 'base64');
    const originalImage = await loadImage(imgBuffer);
    
    // Calculate scaling to fit the image properly while maintaining aspect ratio
    const imgAspectRatio = originalImage.width / originalImage.height;
    const canvasAspectRatio = STANDARD_WIDTH / STANDARD_HEIGHT;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspectRatio > canvasAspectRatio) {
      // Image is wider - fit by width
      drawWidth = STANDARD_WIDTH;
      drawHeight = STANDARD_WIDTH / imgAspectRatio;
      offsetX = 0;
      offsetY = (STANDARD_HEIGHT - drawHeight) / 2;
    } else {
      // Image is taller - fit by height
      drawHeight = STANDARD_HEIGHT;
      drawWidth = STANDARD_HEIGHT * imgAspectRatio;
      offsetX = (STANDARD_WIDTH - drawWidth) / 2;
      offsetY = 0;
    }
    
    // Fill background with black to ensure consistent background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, STANDARD_WIDTH, STANDARD_HEIGHT);
    
    // Draw the original image centered and scaled
    ctx.drawImage(originalImage, offsetX, offsetY, drawWidth, drawHeight);
    
    // Add standardized aura effects with consistent zone positioning
    addStandardizedAuraEffects(
      ctx, 
      STANDARD_WIDTH, 
      STANDARD_HEIGHT, 
      auraAnalysis.dominantColor, 
      auraAnalysis.secondaryColor,
      auraAnalysis.auraLayerColors || {},
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );
    
    // Add watermark to bottom left at 50% opacity
    addWatermark(ctx, STANDARD_WIDTH, STANDARD_HEIGHT);
    
    // Convert canvas to base64
    const processedImageBase64 = canvas.toDataURL('image/jpeg', 0.95);
    
    console.log(`Aura visualization completed successfully`);
    console.log(`Output dimensions: ${STANDARD_WIDTH}x${STANDARD_HEIGHT}px`);
    console.log(`======================================\n`);
    
    return processedImageBase64;
    
  } catch (error) {
    console.error("Error generating aura visualization:", error);
    console.log("Falling back to original image");
    return originalImageBase64;
  }
}

/**
 * Adds standardized aura effects with distinct zone positioning 
 * Based on user requirements: left=receiving, right=giving, top=thinking, edges=personality
 */
function addStandardizedAuraEffects(
  ctx: any, 
  canvasWidth: number, 
  canvasHeight: number, 
  dominantColor: string, 
  secondaryColor: string,
  auraLayerColors: any,
  imageOffsetX: number,
  imageOffsetY: number,
  imageWidth: number,
  imageHeight: number
) {
  // Get color values for all zones
  const dominantRGB = getColorRGB(dominantColor);
  const secondaryRGB = getColorRGB(secondaryColor);
  const receivingRGB = getColorRGB(auraLayerColors.receiving || dominantColor);
  const givingRGB = getColorRGB(auraLayerColors.giving || secondaryColor);
  const thinkingRGB = getColorRGB(auraLayerColors.thinking || dominantColor);
  const personalityRGB = getColorRGB(auraLayerColors.personality || secondaryColor);
  
  // Calculate person center based on image positioning
  const personCenterX = imageOffsetX + imageWidth / 2;
  const personCenterY = imageOffsetY + imageHeight / 2;
  
  console.log(`Person center: ${personCenterX}, ${personCenterY}`);
  console.log(`Image bounds: ${imageOffsetX}, ${imageOffsetY}, ${imageWidth}, ${imageHeight}`);
  
  // Set blend mode for ultra-smooth, cohesive aura effects
  ctx.globalCompositeOperation = 'multiply';
  
  // ZONE 1: LEFT SIDE - RECEIVING ENERGY (Purple/Violet zones in examples)
  console.log('Drawing receiving zone (left) with increased density...');
  
  // Create seamless, blended smoke layers to avoid scattered appearance
  for (let layer = 0; layer < 3; layer++) {
    const layerOffset = layer * 25;
    const baseOpacity = 0.35 - (layer * 0.08); // Lower opacity for smoother blend
    
    const receivingGradient = ctx.createLinearGradient(0, 0, (canvasWidth * 0.75) + layerOffset, 0);
    receivingGradient.addColorStop(0, `rgba(${receivingRGB.r}, ${receivingRGB.g}, ${receivingRGB.b}, ${baseOpacity})`);
    receivingGradient.addColorStop(0.3, `rgba(${receivingRGB.r}, ${receivingRGB.g}, ${receivingRGB.b}, ${baseOpacity * 0.8})`);
    receivingGradient.addColorStop(0.6, `rgba(${receivingRGB.r}, ${receivingRGB.g}, ${receivingRGB.b}, ${baseOpacity * 0.5})`);
    receivingGradient.addColorStop(0.9, `rgba(${receivingRGB.r}, ${receivingRGB.g}, ${receivingRGB.b}, ${baseOpacity * 0.2})`);
    receivingGradient.addColorStop(1, `rgba(${receivingRGB.r}, ${receivingRGB.g}, ${receivingRGB.b}, 0)`);
    
    ctx.fillStyle = receivingGradient;
    ctx.fillRect(0, 0, canvasWidth * 0.75, canvasHeight);
  }
  
  // ZONE 2: RIGHT SIDE - GIVING ENERGY (Green zones in examples)
  console.log('Drawing giving zone (right) with increased density...');
  
  // Create seamless, blended smoke layers to avoid scattered appearance
  for (let layer = 0; layer < 3; layer++) {
    const layerOffset = layer * 25;
    const baseOpacity = 0.35 - (layer * 0.08); // Lower opacity for smoother blend
    
    const givingGradient = ctx.createLinearGradient(canvasWidth, 0, (canvasWidth * 0.25) - layerOffset, 0);
    givingGradient.addColorStop(0, `rgba(${givingRGB.r}, ${givingRGB.g}, ${givingRGB.b}, ${baseOpacity})`);
    givingGradient.addColorStop(0.3, `rgba(${givingRGB.r}, ${givingRGB.g}, ${givingRGB.b}, ${baseOpacity * 0.8})`);
    givingGradient.addColorStop(0.6, `rgba(${givingRGB.r}, ${givingRGB.g}, ${givingRGB.b}, ${baseOpacity * 0.5})`);
    givingGradient.addColorStop(0.9, `rgba(${givingRGB.r}, ${givingRGB.g}, ${givingRGB.b}, ${baseOpacity * 0.2})`);
    givingGradient.addColorStop(1, `rgba(${givingRGB.r}, ${givingRGB.g}, ${givingRGB.b}, 0)`);
    
    ctx.fillStyle = givingGradient;
    ctx.fillRect(canvasWidth * 0.25, 0, canvasWidth * 0.75, canvasHeight);
  }
  
  // ZONE 3: TOP - THINKING ENERGY (Yellow/Orange zones in examples)
  console.log('Drawing thinking zone (top) with increased density...');
  
  // Create seamless thinking zone with smooth transitions
  for (let layer = 0; layer < 2; layer++) {
    const layerOffset = layer * 20;
    const baseOpacity = 0.28 - (layer * 0.08); // Reduced opacity for subtlety
    
    const thinkingGradient = ctx.createLinearGradient(0, 0, 0, (canvasHeight * 0.4) + layerOffset);
    thinkingGradient.addColorStop(0, `rgba(${thinkingRGB.r}, ${thinkingRGB.g}, ${thinkingRGB.b}, ${baseOpacity})`);
    thinkingGradient.addColorStop(0.3, `rgba(${thinkingRGB.r}, ${thinkingRGB.g}, ${thinkingRGB.b}, ${baseOpacity * 0.7})`);
    thinkingGradient.addColorStop(0.6, `rgba(${thinkingRGB.r}, ${thinkingRGB.g}, ${thinkingRGB.b}, ${baseOpacity * 0.4})`);
    thinkingGradient.addColorStop(1, `rgba(${thinkingRGB.r}, ${thinkingRGB.g}, ${thinkingRGB.b}, 0)`);
    
    ctx.fillStyle = thinkingGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.4);
  }
  
  // ZONE 4: EDGES - PERSONALITY ENERGY (Outer rim effect with increased density)
  console.log('Drawing personality zone (edges) with increased density...');
  
  // Create subtle edge effects for cohesive appearance
  const edgeThickness = 100; // Reduced for less scattered look
  const edgeLayers = 2; // Fewer layers for cleaner appearance
  
  for (let layer = 0; layer < edgeLayers; layer++) {
    const layerOffset = layer * 15;
    const baseOpacity = 0.25 - (layer * 0.08); // Much lower opacity
    
    // Top edge
    const topEdgeGradient = ctx.createLinearGradient(0, 0, 0, edgeThickness - layerOffset);
    topEdgeGradient.addColorStop(0, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, ${baseOpacity})`);
    topEdgeGradient.addColorStop(0.6, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, ${baseOpacity * 0.6})`);
    topEdgeGradient.addColorStop(1, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, 0)`);
    ctx.fillStyle = topEdgeGradient;
    ctx.fillRect(0, 0, canvasWidth, edgeThickness);
    
    // Bottom edge
    const bottomEdgeGradient = ctx.createLinearGradient(0, canvasHeight, 0, canvasHeight - (edgeThickness - layerOffset));
    bottomEdgeGradient.addColorStop(0, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, ${baseOpacity})`);
    bottomEdgeGradient.addColorStop(0.6, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, ${baseOpacity * 0.6})`);
    bottomEdgeGradient.addColorStop(1, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, 0)`);
    ctx.fillStyle = bottomEdgeGradient;
    ctx.fillRect(0, canvasHeight - edgeThickness, canvasWidth, edgeThickness);
    
    // Left edge
    const leftEdgeGradient = ctx.createLinearGradient(0, 0, edgeThickness - layerOffset, 0);
    leftEdgeGradient.addColorStop(0, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, ${baseOpacity * 0.8})`);
    leftEdgeGradient.addColorStop(0.6, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, ${baseOpacity * 0.5})`);
    leftEdgeGradient.addColorStop(1, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, 0)`);
    ctx.fillStyle = leftEdgeGradient;
    ctx.fillRect(0, 0, edgeThickness, canvasHeight);
    
    // Right edge
    const rightEdgeGradient = ctx.createLinearGradient(canvasWidth, 0, canvasWidth - (edgeThickness - layerOffset), 0);
    rightEdgeGradient.addColorStop(0, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, ${baseOpacity * 0.8})`);
    rightEdgeGradient.addColorStop(0.6, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, ${baseOpacity * 0.5})`);
    rightEdgeGradient.addColorStop(1, `rgba(${personalityRGB.r}, ${personalityRGB.g}, ${personalityRGB.b}, 0)`);
    ctx.fillStyle = rightEdgeGradient;
    ctx.fillRect(canvasWidth - edgeThickness, 0, edgeThickness, canvasHeight);
  }
  
  // Add multiple layers of dense energy wisps for much more prominent smokey effect
  console.log('Adding multiple layers of dense energy wisps...');
  
  // Single layer of subtle wisps for cleaner appearance
  addEnergyWisps(ctx, canvasWidth, canvasHeight, dominantRGB, secondaryRGB, 24, 0.15, 18);
  
  // Add dense radial smoke clouds around the person for ultra-smokey effect
  console.log('Adding dense radial smoke clouds...');
  addDenseSmokeyClouds(ctx, personCenterX, personCenterY, imageWidth, imageHeight, dominantRGB, secondaryRGB);
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
  
  console.log('All aura zones applied successfully');
}

function addEnergyWisps(
  ctx: any, 
  width: number, 
  height: number, 
  primaryRGB: any, 
  secondaryRGB: any,
  numWisps: number = 12,
  baseOpacity: number = 0.3,
  baseRadius: number = 15
) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  ctx.globalCompositeOperation = 'multiply';
  
  for (let i = 0; i < numWisps; i++) {
    const angle = (i / numWisps) * Math.PI * 2;
    // Use deterministic distance patterns for consistency
    const distanceMultiplier = 0.2 + ((i % 3) * 0.15); // Creates 3 consistent distance rings
    const distance = Math.min(width, height) * distanceMultiplier;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    // Use consistent radius patterns instead of random
    const radiusVariation = (i % 4) * 2; // Creates 4 different size patterns
    const radius = baseRadius + radiusVariation;
    const opacityVariation = (i % 3) * 0.05; // Creates 3 opacity levels
    const opacity = baseOpacity + opacityVariation;
    
    const wispGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const color = i % 2 === 0 ? primaryRGB : secondaryRGB;
    
    wispGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
    wispGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.6})`);
    wispGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    ctx.fillStyle = wispGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add additional smokey wisps around main ones for density
    if (i % 3 === 0) {
      for (let j = 0; j < 3; j++) {
        // Use consistent offset patterns instead of random
        const angleOffset = (j - 1) * 0.3; // Creates consistent -0.3, 0, 0.3 pattern
        const offsetAngle = angle + angleOffset;
        const distanceOffset = (j - 1) * 12; // Creates consistent distance variations
        const offsetDistance = distance + distanceOffset;
        const offsetX = centerX + Math.cos(offsetAngle) * offsetDistance;
        const offsetY = centerY + Math.sin(offsetAngle) * offsetDistance;
        
        const smallRadius = baseRadius * 0.6;
        const smallOpacity = baseOpacity * 0.4;
        
        const smallWispGradient = ctx.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, smallRadius);
        smallWispGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${smallOpacity})`);
        smallWispGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = smallWispGradient;
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, smallRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function addDenseSmokeyClouds(
  ctx: any,
  centerX: number,
  centerY: number,
  personWidth: number,
  personHeight: number,
  primaryRGB: any,
  secondaryRGB: any
) {
  ctx.globalCompositeOperation = 'multiply';
  
  // Create fewer, larger smoke rings for cleaner appearance
  const cloudRings = 2;
  const baseRadius = Math.max(personWidth, personHeight) * 0.25;
  
  for (let ring = 0; ring < cloudRings; ring++) {
    const ringRadius = baseRadius + (ring * 60);
    const numClouds = 12 + (ring * 2); // Fewer clouds for less scatter
    const opacity = 0.20 - (ring * 0.05); // Lower base opacity
    
    for (let cloud = 0; cloud < numClouds; cloud++) {
      const angle = (cloud / numClouds) * Math.PI * 2;
      // Use deterministic variations for consistency
      const variationPattern = (cloud % 5) * 10 - 25; // Creates 5 consistent patterns
      const radiusVariation = ringRadius + variationPattern;
      const x = centerX + Math.cos(angle) * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusVariation;
      
      // Use consistent cloud sizes based on pattern
      const sizePattern = (cloud % 3) * 5; // Creates 3 size patterns
      const cloudRadius = 25 + sizePattern;
      const opacityPattern = (cloud % 4) * 0.02; // Creates 4 opacity patterns
      const cloudOpacity = opacity + opacityPattern;
      
      const color = cloud % 2 === 0 ? primaryRGB : secondaryRGB;
      
      // Create soft, diffuse smoke clouds
      const smokeGradient = ctx.createRadialGradient(x, y, 0, x, y, cloudRadius);
      smokeGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${cloudOpacity})`);
      smokeGradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${cloudOpacity * 0.8})`);
      smokeGradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${cloudOpacity * 0.4})`);
      smokeGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      
      ctx.fillStyle = smokeGradient;
      ctx.beginPath();
      ctx.arc(x, y, cloudRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Add minimal inner aura for subtlety
  const innerClouds = 16;
  const innerRadius = Math.min(personWidth, personHeight) * 0.35;
  
  for (let i = 0; i < innerClouds; i++) {
    const angle = (i / innerClouds) * Math.PI * 2;
    // Use consistent patterns for inner clouds
    const distancePattern = (i % 4) * 5 - 10; // Creates 4 consistent distance patterns
    const distance = innerRadius + distancePattern;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    // Use consistent radius patterns
    const radiusPattern = (i % 3) * 3; // Creates 3 radius patterns
    const cloudRadius = 15 + radiusPattern;
    const color = i % 3 === 0 ? primaryRGB : secondaryRGB;
    
    const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, cloudRadius);
    innerGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.45)`);
    innerGradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`);
    innerGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(x, y, cloudRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function addWatermark(ctx: any, canvasWidth: number, canvasHeight: number) {
  // Reset composite operation to normal for watermark
  ctx.globalCompositeOperation = 'source-over';
  
  // Set watermark text properties
  const watermarkText = "left";
  const fontSize = Math.floor(canvasWidth * 0.025); // Responsive font size based on canvas width
  const x = 30; // 30px from left edge
  const y = canvasHeight - 30; // 30px from bottom edge
  
  // Configure text styling
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // White text at 50% opacity
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  
  // Add text shadow for better visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 2;
  
  // Draw the watermark text
  ctx.fillText(watermarkText, x, y);
  
  // Reset shadow settings
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
}

function getColorRGB(colorName: string): { r: number, g: number, b: number } {
  const colorMap: { [key: string]: { r: number, g: number, b: number } } = {
    'Red': { r: 255, g: 100, b: 100 },
    'Orange': { r: 255, g: 165, b: 0 },
    'Yellow': { r: 255, g: 255, b: 100 },
    'Green': { r: 100, g: 255, b: 100 },
    'Blue': { r: 100, g: 150, b: 255 },
    'Indigo': { r: 75, g: 0, b: 130 },
    'Violet': { r: 238, g: 130, b: 238 },
    'Pink': { r: 255, g: 192, b: 203 },
    'White': { r: 255, g: 255, b: 255 },
    'Black': { r: 50, g: 50, b: 50 },
    'Gold': { r: 255, g: 215, b: 0 },
    'Silver': { r: 192, g: 192, b: 192 },
    'Purple': { r: 128, g: 0, b: 128 },
    'brown': { r: 165, g: 42, b: 42 },
    'Gray': { r: 128, g: 128, b: 128 },
  };
  
  return colorMap[colorName] || colorMap['Blue'];
}

/**
 * Analyzes an image using Google's Gemini API as a backup for aura analysis
 */
export async function analyzeImageWithGemini(base64Image: string): Promise<AuraAnalysisResult> {
  try {
    // This is a simplified implementation since this is fallback
    // In production, you would make an actual call to the Gemini API
    
    const apiKey = process.env.GEMINI_API_KEY;
    const apiEndpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent";
    
    // Prepare the image for the API
    const imageContent = base64Image.startsWith('data:') 
      ? base64Image.split(',')[1] 
      : base64Image;
    
    // Build request payload with an enhanced prompt for aura color detection
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert in analyzing SPECIALIZED AURA PHOTOGRAPHS that show colored energy fields around people.

EXTREMELY IMPORTANT: You must ONLY analyze the ACTUAL visible colored light/energy surrounding the person in the photograph. 

DO NOT invent or make up colors that aren't visible in the image. Your analysis must be based SOLELY on the colors you can actually see in the energy field around the person.

Specifically:
1. ACCURATELY identify 4-5 different colors in the visible energy field (aura) surrounding the person
2. Focus on any glowing, luminous, hazy, or distinct colored lights forming a field or halo around the person
3. Completely ignore clothing colors, background elements, or anything that is not part of the energy field
4. Be precise about identifying where each color appears (inner aura close to body, middle field, outer edges)

Respond with valid JSON containing:
- dominantColor: The PRIMARY aura color visible in the energy field (like "Purple", "Blue", "Green")
- secondaryColor: The SECONDARY aura color visible in the energy field
- auraColorSpectrum: Array of 4-5 different colors actually visible in the aura field in order of prominence
- auraLayerColors: Object mapping aura layers to their colors { "inner": "color", "middle": "color", "outer": "color" }
- energyLevel: Intensity of the energy field (1-10)
- personalityTraits: 4-5 spiritual/personality traits associated with these SPECIFIC aura colors
- spiritualGuidance: Detailed spiritual guidance based on these SPECIFIC aura colors (150+ words)
- chakraActivity: Activity levels for each chakra (root, sacral, solarPlexus, heart, throat, thirdEye, crown) on scale 1-10
- detailedAnalysis: In-depth interpretation of what these SPECIFIC aura colors reveal, discussing all 4-5 colors (250+ words)`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageContent
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,  // Lower temperature for more consistent results
        maxOutputTokens: 1500  // Increased token limit for more detailed analysis
      }
    };
    
    // Make the API call to Gemini
    const response = await axios.post(
      `${apiEndpoint}?key=${apiKey}`, 
      payload, 
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    // Parse the response - Gemini might return the JSON as text
    // So we need to extract and parse it
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response text
    let jsonStr = responseText;
    if (responseText.includes('{') && responseText.includes('}')) {
      jsonStr = responseText.substring(
        responseText.indexOf('{'),
        responseText.lastIndexOf('}') + 1
      );
    }
    
    // Parse the JSON
    let result: Partial<AuraAnalysisResult> = {};
    try {
      result = JSON.parse(jsonStr) as Partial<AuraAnalysisResult>;
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // Fallback to structured data from the text
      result = fallbackParser(responseText);
    }
    
    // Default values in case some fields are missing
    const defaultResult: AuraAnalysisResult = {
      dominantColor: "Blue",
      secondaryColor: "Green", 
      // Extended spectrum with multiple colors
      auraColorSpectrum: ["Blue", "Green", "Indigo", "Violet", "Purple"],
      auraLayerColors: {
        inner: "Blue",
        middle: "Green",
        outer: "Indigo"
      },
      energyLevel: 6,
      personalityTraits: ["Intuitive", "Healing", "Compassionate", "Balanced"],
      spiritualGuidance: "Your aura indicates a strong connection to your intuition and higher guidance. Continue to develop your spiritual practices and trust your inner wisdom.",
      _chakraActivity: {
          root: 5,
          sacral: 6,
          solarPlexus: 5,
          heart: 7,
          throat: 6,
          thirdEye: 8,
          crown: 7
      },
      get chakraActivity() {
          return this._chakraActivity;
      },
      set chakraActivity(value) {
          this._chakraActivity = value;
      },
      detailedAnalysis: "The colors in your aura reveal a person with strong intuitive and psychic abilities. You likely sense energies around you and may have experienced spiritual insights or visions. Your challenge is to remain grounded while exploring higher consciousness. Regular meditation will help integrate your spiritual experiences."
        };

    // Return merged results with default values filling in any missing fields
    return {
      ...defaultResult,
      ...result,
      // Ensure the aura layers are properly merged
      auraLayerColors: {
        ...defaultResult.auraLayerColors,
        ...(result.auraLayerColors || {})
      },
      // Ensure the chakra activity is properly merged
      chakraActivity: {
        ...defaultResult.chakraActivity,
        ...(result.chakraActivity || {})
      }
    };
    
  } catch (error) {
    console.error("Error in Gemini analysis:", error);
    
    // Return a fallback response
    return {
      dominantColor: "Indigo",
      secondaryColor: "Violet",
      // Extended spectrum with multiple colors for fallback
      auraColorSpectrum: ["Indigo", "Violet", "Purple", "Blue", "White"],
      auraLayerColors: {
        inner: "Indigo",
        middle: "Violet", 
        outer: "Blue",
        receiving: "Purple",
        giving: "Green",
        thinking: "Yellow",
        personality: "Red"
      },
      energyLevel: 7,
      personalityTraits: ["Intuitive", "Spiritual", "Visionary", "Sensitive"],
      spiritualGuidance: "Your aura indicates a strong spiritual connection. Focus on grounding exercises to balance your intuitive abilities with everyday reality. Meditation will help you channel your energy more effectively.",
      chakraActivity: {
        root: 5,
        sacral: 6,
        solarPlexus: 5,
        heart: 7,
        throat: 6,
        thirdEye: 9,
        crown: 8
      },
      detailedAnalysis: "The dominant indigo and violet hues in your aura suggest you have highly developed intuitive and spiritual abilities. You may be experiencing a period of spiritual awakening or growth. These colors indicate a strong connection to higher consciousness and the ability to access inner wisdom. Your energy field shows sensitivity to others' emotions and a natural healing ability. Focus on protecting your energy through regular grounding practices and setting healthy boundaries."
    };
  }
}

/**
 * Fallback parser for when JSON parsing fails
 */
function fallbackParser(text: string): Partial<AuraAnalysisResult> {
  const result: Partial<AuraAnalysisResult> = {
    // Initialize the chakraActivity to fix TypeScript error
    chakraActivity: {
      root: 4,
      sacral: 6,
      solarPlexus: 5,
      heart: 7,
      throat: 6,
      thirdEye: 8,
      crown: 7
    },
    // Initialize aura color spectrum with default values
    auraColorSpectrum: [],
    auraLayerColors: {
      inner: "",
      middle: "",
      outer: ""
    }
  };
  
  // Extract dominant color
  const dominantColorMatch = text.match(/dominant\s*color\s*[:-]\s*([a-zA-Z]+)/i);
  if (dominantColorMatch) result.dominantColor = dominantColorMatch[1];
  
  // Extract secondary color
  const secondaryColorMatch = text.match(/secondary\s*color\s*[:-]\s*([a-zA-Z]+)/i);
  if (secondaryColorMatch) result.secondaryColor = secondaryColorMatch[1];
  
  // If we have dominant and secondary colors, use them to create a default spectrum
  if (result.dominantColor && result.secondaryColor) {
    result.auraColorSpectrum = [
      result.dominantColor,
      result.secondaryColor,
      "Indigo", // Default third color
      "Blue",   // Default fourth color
      "Violet"  // Default fifth color
    ];
    
    result.auraLayerColors = {
      inner: result.dominantColor,
      middle: result.secondaryColor,
      outer: "Indigo" // Default outer layer
    };
  }
  
  // Extract energy level
  const energyLevelMatch = text.match(/energy\s*level\s*[:-]\s*(\d+)/i);
  if (energyLevelMatch) result.energyLevel = parseInt(energyLevelMatch[1]);
  
  // Extract personality traits
  const personalitySection = text.match(/personality\s*traits\s*[:-]\s*([^\.]+)/i);
  if (personalitySection) {
    result.personalityTraits = personalitySection[1]
      .split(/[,;]/)
      .map(trait => trait.trim())
      .filter(trait => trait.length > 0);
  }
  
  // Extract spiritual guidance
  const guidanceSection = text.match(/spiritual\s*guidance\s*[:-]\s*([^#]+)/i);
  if (guidanceSection) result.spiritualGuidance = guidanceSection[1].trim();
  
  // Extract detailed analysis
  const analysisSection = text.match(/detailed\s*analysis\s*[:-]\s*([^#]+)/i);
  if (analysisSection) result.detailedAnalysis = analysisSection[1].trim();
  
  return result;
}
