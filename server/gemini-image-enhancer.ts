import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyD6JjIvGh0wXbukj4vIm_9-8Mlu2rnGq4o';

export async function enhanceImageWithAura(
  imageBase64: string, 
  auraColors: { dominantColor: string; secondaryColor: string; auraColors: string[] }
): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the prompt for aura enhancement
    const prompt = `Add a beautiful smokey aura effect around the person in this image using these specific colors:
- Dominant aura color: ${auraColors.dominantColor}
- Secondary aura color: ${auraColors.secondaryColor}  
- Additional aura colors: ${auraColors.auraColors.join(', ')}

Instructions:
- Create dense, mystical smokey effects flowing around the entire person
- Use the exact colors provided to create realistic aura visualization
- Preserve the person's face completely clear and visible
- Fill the area around the person with beautiful flowing aura energy
- Make it look professional and spiritually authentic
- Ensure the smokey effect appears natural and well-blended

The result should show a person with a stunning aura visualization while keeping their facial features perfectly clear.`;

    // Convert base64 to the format Gemini expects
    const imageData = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    
    // Gemini returns text description, not images - return the analysis
    const enhancementDescription = response.text();
    
    // Return a structured response indicating Gemini's enhancement suggestions
    return {
      success: true,
      description: enhancementDescription,
      suggestedColors: auraColors,
      message: "Gemini has analyzed your image and provided enhancement suggestions based on your aura colors."
    };
    
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to enhance image with Gemini');
  }
}