
import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return '';
  }
}

export function processPDFContent(pdfText: string) {
  // Extract relevant sections based on your PDF structure
  // Extract sections using more flexible patterns
  const sections = {
    remedies: pdfText.match(/(?:Remedies|Remedy|Solutions?):(.*?)(?=\n\n|\n[A-Z]|$)/si)?.[1]?.trim() || '',
    calculations: pdfText.match(/(?:Calculations?|Numerology|Numbers?):(.*?)(?=\n\n|\n[A-Z]|$)/si)?.[1]?.trim() || '',
    monthlyYearlyMeanings: pdfText.match(/(?:Monthly|Yearly|Temporal|Period)\s+(?:Meanings?|Interpretations?):(.*?)(?=\n\n|\n[A-Z]|$)/si)?.[1]?.trim() || '',
    auraChakra: pdfText.match(/(?:Aura|Chakra|Energy)\s*[&\+]?\s*(?:Analysis|Reading|Pattern):(.*?)(?=\n\n|\n[A-Z]|$)/si)?.[1]?.trim() || '',
    fortuneForecasts: pdfText.match(/(?:Fortune|Future|Forecast|Prediction)(?:\s+\d{4})?:(.*?)(?=\n\n|\n[A-Z]|$)/si)?.[1]?.trim() || '',
    spiritualGuidance: pdfText.match(/(?:Spiritual|Divine|Higher)\s+(?:Guidance|Direction|Path):(.*?)(?=\n\n|\n[A-Z]|$)/si)?.[1]?.trim() || ''
  };
  
  // Clean up the extracted text
  Object.keys(sections).forEach(key => {
    sections[key] = sections[key]
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
      .trim();
  });
  
  return sections;
}
