import { useState, ChangeEvent } from "react";
import { Upload, FileImage, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

export default function ImageUpload({ onImageSelect, isLoading = false }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageSelect(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onImageSelect(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          className={`border-2 border-dashed ${
            dragActive ? 'border-primary bg-primary' : 'border-gray-300'
          } rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer h-64`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <Upload className="h-12 w-12 text-primary mb-4" />
          <p className="font-medium text-white mb-2">Drag and drop your photo here</p>
          <p className="text-sm text-white mb-4 text-center">or click to browse your files</p>
          <Button className="bg-primary hover:bg-primary-dark">
            Select Image
          </Button>
          <p className="text-xs text-white mt-4 text-center">Supported formats: JPG, PNG, HEIC. Max size: 12MB</p>
        </div>
      ) : (
        <Card className="relative rounded-xl overflow-hidden">
          <div className="relative aspect-square md:aspect-video w-full overflow-hidden bg-gray-100">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-full object-cover"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <span className="text-white ml-2">Analyzing image...</span>
              </div>
            )}
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FileImage className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500 truncate">Image selected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
