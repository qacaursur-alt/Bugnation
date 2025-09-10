import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

export default function FileUpload({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = ""
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Check file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError(`File type not supported. Accepted types: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-slate-300 hover:border-slate-400'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-slate-100 rounded-full">
            <ImageIcon className="h-6 w-6 text-slate-600" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-900">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-500">
              {accept === "image/*" ? "PNG, JPG, GIF up to" : "Files up to"} {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
          
          <Button type="button" variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <X className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}