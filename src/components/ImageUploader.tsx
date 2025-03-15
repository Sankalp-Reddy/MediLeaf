
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Image, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  isLoading, 
  className 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Send to parent
    onImageSelected(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={cn(
        'relative w-full transition-all',
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <div
        onClick={triggerFileInput}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all overflow-hidden',
          'cursor-pointer hover:border-primary/70 group hover-lift min-h-[300px]',
          previewUrl ? 'border-primary/40 bg-muted/30' : 'border-muted-foreground/30 bg-muted/10',
          dragActive ? 'border-primary/70 bg-primary/5' : '',
          isLoading ? 'opacity-75 cursor-not-allowed' : '',
          'glass'
        )}
      >
        {previewUrl ? (
          <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="object-contain max-h-[400px] p-2 rounded-lg animate-fade-in"
            />
            {!isLoading && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 opacity-80 hover:opacity-100 glass-dark transition-opacity"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mb-4 rounded-full bg-secondary/80 p-3 mx-auto w-fit">
              <Image className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Upload a Leaf Image</h3>
            <p className="text-muted-foreground text-sm max-w-[280px] mb-4">
              Drag and drop an image or click to browse
            </p>
            <Button
              variant="outline"
              disabled={isLoading}
              className="group-hover:bg-primary/10"
            >
              <Upload className="h-4 w-4 mr-2" /> Select Image
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Supports: JPG, PNG, WEBP
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
