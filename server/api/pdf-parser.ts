
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
  const sections = {
    remedies: pdfText.match(/Remedies:(.*?)(?=\n\n|\n[A-Z]|$)/s)?.[1]?.trim() || '',
    calculations: pdfText.match(/Calculations:(.*?)(?=\n\n|\n[A-Z]|$)/s)?.[1]?.trim() || '',
    monthlyYearlyMeanings: pdfText.match(/Monthly\/Yearly Meanings:(.*?)(?=\n\n|\n[A-Z]|$)/s)?.[1]?.trim() || '',
    auraChakra: pdfText.match(/Aura & Chakra:(.*?)(?=\n\n|\n[A-Z]|$)/s)?.[1]?.trim() || '',
  };
  
  return sections;
}
