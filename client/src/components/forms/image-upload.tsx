import { useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

export default function ImageUpload({ onImageSelect, isLoading }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={
        "flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors " +
        (isDragging ? "border-yellow-400 bg-yellow-400/10" : "border-white/40 bg-white/5")
      }
    >
      <Upload className="h-10 w-10 text-cyan-100" />
      <p className="text-sm text-cyan-100">Drag &amp; drop a photo here, or</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid="vibe-file-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        disabled={isLoading}
        onClick={() => inputRef.current?.click()}
        className="bg-yellow-500 text-white hover:bg-yellow-600"
      >
        {isLoading ? "Analyzing..." : "Choose Photo"}
      </Button>
    </div>
  );
}
