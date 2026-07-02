import { extractText, getDocumentProxy } from 'unpdf';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // getDocumentProxy expects a Uint8Array
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  } catch (error) {
    console.error('unpdf error:', error);
    throw new Error('Impossible de lire le fichier PDF');
  }
}

