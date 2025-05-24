import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { promises as fsPromises } from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Configures multer for handling file uploads
 */
export function configureFileUpload() {
  // For production, use a temporary in-memory storage
  // This is sufficient for our purposes since we're processing the image immediately
  const storage = multer.memoryStorage();

  // Configure the file filter to only accept images
  const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only image files
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and HEIC image files are allowed'));
    }
  };

  // Configure size limits - reduced to prevent "request entity too large" errors
  const limits = {
    fileSize: 2 * 1024 * 1024, // 2MB max file size
  };

  // Create and return the multer instance
  return multer({ 
    storage, 
    fileFilter,
    limits 
  });
}

/**
 * Saves an uploaded file to a temporary location
 * Note: For production, you'd want to use a proper cloud storage solution
 */
export function saveUploadedFile(file: Express.Multer.File): string {
  // Create a unique filename
  const uniqueId = nanoid();
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const filename = `${uniqueId}${fileExtension}`;

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Write the file
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, file.buffer);

  return filePath;
}

/**
 * Converts a file to base64 encoding
 */
export function fileToBase64(filePath: string): string {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}

/**
 * Deletes a temporary file
 */
export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Parses a PDF file and extracts text
 */
async function parsePDF(pdfPath: string): Promise<string> {
  try {
    const dataBuffer = await fsPromises.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}

/**
 * Extracts remedies from the PDF text.
 * This is a placeholder and needs to be implemented based on the structure of your PDF.
 */
function extractRemedies(pdfText: string): string[] {
  // Implement your logic to extract remedies from the pdfText here
  // This is just a placeholder
  const remedies: string[] = [];
  const lines = pdfText.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('remedy:')) {
      remedies.push(line.trim());
    }
  }
  return remedies;
}