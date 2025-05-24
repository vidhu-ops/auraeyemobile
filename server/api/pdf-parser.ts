
import * as fs from 'fs';
import * as pdfjs from 'pdfjs-dist';

export async function parsePDF(filePath: string): Promise<string> {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjs.getDocument(data);
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return '';
  }
}

export function extractRemedies(pdfText: string): string[] {
  const remedySection = pdfText.match(/Remedies:(.*?)(?=\n\n|\n[A-Z]|$)/s)?.[1] || '';
  return remedySection
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}
