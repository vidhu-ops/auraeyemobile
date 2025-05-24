
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textItems = content.items as TextItem[];
      const pageText = textItems.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

export function parseAuraReferences(text: string) {
  // Extract key aura and chakra information from the reference PDF
  const auraPatterns = {
    colors: /(?:aura color|color vibration):\s*([^\.]+)/gi,
    meanings: /meaning(?:s)?:\s*([^\.]+)/gi,
    chakras: /chakra\s+(?:association|connection):\s*([^\.]+)/gi
  };
  
  return {
    colors: text.match(auraPatterns.colors) || [],
    meanings: text.match(auraPatterns.meanings) || [],
    chakraConnections: text.match(auraPatterns.chakras) || []
  };
}

export function parseFortuneCalculations(text: string) {
  // Extract numerological and fortune calculation references
  const patterns = {
    numbers: /number\s+(\d+):\s*([^\.]+)/gi,
    predictions: /prediction(?:s)?:\s*([^\.]+)/gi,
    remedies: /remed(?:y|ies):\s*([^\.]+)/gi
  };
  
  return {
    numberMeanings: text.match(patterns.numbers) || [],
    predictions: text.match(patterns.predictions) || [],
    remedies: text.match(patterns.remedies) || []
  };
}
