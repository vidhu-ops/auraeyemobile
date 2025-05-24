
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
  // Extract sections with more comprehensive patterns
  const sections = {
    remedies: extractSection(pdfText, [
      /(?:Remedies|Remedy|Solutions?|Recommendations?)(?:\s*for)?:/si,
      /(?:Spiritual\s+)?(?:Healing|Treatment)\s+(?:Methods?|Approaches?):/si
    ]),
    calculations: extractSection(pdfText, [
      /(?:Calculations?|Numerology|Numbers?|Numerical\s+Analysis):/si,
      /(?:Mathematical|Cosmic)\s+(?:Patterns?|Sequences?):/si
    ]),
    monthlyYearlyMeanings: extractSection(pdfText, [
      /(?:Monthly|Yearly|Temporal|Period|Seasonal)\s+(?:Meanings?|Interpretations?|Influences?):/si,
      /(?:Time|Cycle)\s+(?:Based|Related)\s+(?:Analysis|Reading):/si
    ]),
    auraChakra: extractSection(pdfText, [
      /(?:Aura|Chakra|Energy)\s*[&\+]?\s*(?:Analysis|Reading|Pattern|Field):/si,
      /(?:Energy|Spiritual)\s+(?:Centers?|Nodes?|Points?):/si,
      /(?:Color|Light)\s+(?:Analysis|Interpretation|Meaning):/si
    ]),
    fortuneForecasts: extractSection(pdfText, [
      /(?:Fortune|Future|Forecast|Prediction|Destiny)(?:\s+\d{4})?:/si,
      /(?:Coming|Upcoming)\s+(?:Events|Changes|Developments):/si
    ]),
    spiritualGuidance: extractSection(pdfText, [
      /(?:Spiritual|Divine|Higher|Sacred)\s+(?:Guidance|Direction|Path|Journey):/si,
      /(?:Soul|Spirit|Inner)\s+(?:Message|Communication|Wisdom):/si
    ]),
    colorMeanings: extractSection(pdfText, [
      /(?:Color|Aura|Light)\s+(?:Meanings?|Symbolism|Interpretation):/si,
      /(?:Chromatic|Spectral)\s+(?:Analysis|Reading|Significance):/si
    ]),
    chakraAlignment: extractSection(pdfText, [
      /(?:Chakra|Energy\s+Center)\s+(?:Alignment|Balance|Status):/si,
      /(?:Energy|Force)\s+(?:Distribution|Flow|Pattern):/si
    ])
  };

  function extractSection(text: string, patterns: RegExp[]): string {
    for (const pattern of patterns) {
      const match = text.match(new RegExp(`${pattern.source}(.*?)(?=\\n\\n|\\n[A-Z]|$)`, 'si'));
      if (match?.[1]) {
        return match[1].trim()
          .replace(/\s+/g, ' ')  // Normalize whitespace
          .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
          .trim();
      }
    }
    return '';
  }
  
  // Clean up the extracted text
  Object.keys(sections).forEach(key => {
    sections[key] = sections[key]
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
      .trim();
  });
  
  return sections;
}
