'use client';

/**
 * File Upload Component
 * 
 * Reusable file upload component with drag-and-drop support.
 * Simulates upload for now (can be swapped with S3/uploadthing later).
 */

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, X, FileText, ExternalLink } from 'lucide-react';

export type FileUploadType = 'image' | 'pdf';

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  fileType: FileUploadType;
  label?: string;
  maxSizeMB?: number;
}

/**
 * Simulate file upload (placeholder implementation)
 * 
 * TODO: Replace with actual upload service (uploadthing, S3, etc.)
 */
async function simulateUpload(
  file: File,
  fileType: FileUploadType
): Promise<string> {
  // Simulate upload delay (1.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return a dummy URL
  if (fileType === 'image') {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
  } else {
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  }
}

export default function FileUpload({
  value,
  onChange,
  fileType,
  label,
  maxSizeMB = 10,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (fileType === 'image') {
      if (!file.type.startsWith('image/')) {
        return 'Please select an image file';
      }
    } else if (fileType === 'pdf') {
      if (file.type !== 'application/pdf') {
        return 'Please select a PDF file';
      }
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress (1.5 seconds total, update every 150ms)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const url = await simulateUpload(file, fileType);
      setUploadProgress(100);
      onChange(url);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
      onChange(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      clearInterval(progressInterval);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasFile = value && value.trim().length > 0;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={fileType === 'image' ? 'image/*' : 'application/pdf'}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {hasFile ? (
        <div className="p-4 border border-foreground/10 rounded-md bg-foreground/5">
          {fileType === 'image' ? (
            <div className="flex items-start gap-3">
              <img
                src={value || ''}
                alt="Uploaded image"
                className="w-20 h-20 object-cover rounded-md border border-foreground/10"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Image uploaded</p>
                <p className="text-xs text-foreground/60 mt-0.5">File uploaded successfully</p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 hover:bg-foreground/10 rounded transition-colors flex-shrink-0"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-foreground/60" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-foreground/60 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">PDF uploaded</p>
                <a
                  href={value || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground/60 hover:text-foreground mt-0.5 inline-flex items-center gap-1"
                >
                  View file
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 hover:bg-foreground/10 rounded transition-colors flex-shrink-0"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-foreground/60" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragging
              ? 'border-foreground bg-foreground/10'
              : 'border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {isUploading ? (
            <div className="space-y-3">
              <div className="w-12 h-12 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground">Uploading...</p>
                <div className="mt-2 w-full bg-foreground/10 rounded-full h-2">
                  <div
                    className="bg-foreground h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-foreground/60 mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-foreground/60 mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-foreground/60 mt-1">
                  {fileType === 'image' ? 'PNG, JPG, GIF up to' : 'PDF up to'} {maxSizeMB}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {!hasFile && !isUploading && (
        <p className="text-xs text-foreground/60">
          Maximum file size: {maxSizeMB}MB
        </p>
      )}
    </div>
  );
}
