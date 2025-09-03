import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, RotateCw, RotateCcw, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageManipulatorProps {
  onImageProcessed?: (processedBlob: Blob) => void;
}

export function ImageManipulator({ onImageProcessed }: ImageManipulatorProps) {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Compress image to under 20KB
  const compressImage = async (canvas: HTMLCanvasElement, maxSizeKB: number = 40): Promise<Blob> => {
    return new Promise((resolve) => {
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (blob && blob.size <= maxSizeKB * 1024) {
            resolve(blob);
          } else if (quality > 0.1) {
            quality -= 0.1;
            tryCompress();
          } else {
            // Final attempt with lowest quality
            resolve(blob!);
          }
        }, 'image/jpeg', quality);
      };
      tryCompress();
    });
  };

  const processImage = async (image: HTMLImageElement, flipHorizontal: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);

    // Reduce dimensions for smaller file size (max 400px width)
    const maxWidth = 600;
    const ratio = Math.min(maxWidth / image.width, maxWidth / image.height);
    const newWidth = image.width * ratio;
    const newHeight = image.height * ratio;

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Clear canvas
    ctx.clearRect(0, 0, newWidth, newHeight);

    if (flipHorizontal) {
      // Flip horizontally around center axis
      ctx.scale(-1, 1);
      ctx.drawImage(image, -newWidth, 0, newWidth, newHeight);
      ctx.scale(-1, 1); // Reset scale
    } else {
      ctx.drawImage(image, 0, 0, newWidth, newHeight);
    }

    try {
      const compressedBlob = await compressImage(canvas, 40);
      const processedUrl = URL.createObjectURL(compressedBlob);
      setProcessedImageUrl(processedUrl);
      
      // Call the callback with the processed blob
      onImageProcessed?.(compressedBlob);
      
      toast({
        title: "Image processed successfully",
        description: `File size: ${(compressedBlob.size / 1024).toFixed(1)}KB`,
      });
    } catch (error) {
      toast({
        title: "Error processing image",
        description: "Please try again with a different image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      processImage(img, false); // Process without flipping initially
    };
    img.src = URL.createObjectURL(file);
  };

  const handleFlipLeft = () => {
    if (originalImage) {
      processImage(originalImage, true);
    }
  };

  const handleFlipRight = () => {
    if (originalImage) {
      processImage(originalImage, false);
    }
  };

  const handleDownload = () => {
    if (processedImageUrl) {
      const link = document.createElement('a');
      link.download = 'processed-image.jpg';
      link.href = processedImageUrl;
      link.click();
    }
  };

  const handleClear = () => {
    setOriginalImage(null);
    setProcessedImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Image Manipulation Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="flex justify-center items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Image
          </Button>
          
          {originalImage && (
            <Button 
              onClick={handleClear}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Control Buttons */}
        {originalImage && (
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Button 
              onClick={handleFlipLeft}
              disabled={isProcessing}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Flip Left
            </Button>
            
            <Button 
              onClick={handleFlipRight}
              disabled={isProcessing}
              variant="outline"
              size="lg"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Flip Right
            </Button>
            
            {processedImageUrl && (
              <Button 
                onClick={handleDownload}
                variant="outline"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        )}

        {/* Image Preview */}
        {processedImageUrl && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-sm font-medium text-gray-700">Processed Image:</p>
            
            <div className="flex justify-center">
              <img 
                src={processedImageUrl} 
                alt="Processed" 
                className="max-w-full max-h-96 h-auto rounded-lg border shadow-sm"
              />
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600 mt-2">Processing image...</p>
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}