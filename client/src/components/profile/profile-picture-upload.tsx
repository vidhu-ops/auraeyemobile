import { useState, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

export interface ProfilePictureUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (pictureUrl: string) => void;
}

export function ProfilePictureUploadDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/profile-picture", { pictureUrl: preview });

      toast({
        title: "Success!",
        description: "Your profile picture has been updated",
      });

      onUploadSuccess(preview);
      onOpenChange(false);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Unable to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
          <DialogDescription>
            Choose an image to set as your profile picture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {preview ? (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                data-testid="image-preview"
              />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                data-testid="button-remove-preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50"
              data-testid="button-select-image"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to select image</p>
              <p className="text-xs text-gray-500">Max 5MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-file"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => {
                onOpenChange(false);
                setPreview(null);
              }}
              className="flex-1 bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!preview || isLoading}
              className="flex-1"
              data-testid="button-upload"
            >
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
