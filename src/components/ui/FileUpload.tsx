import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { cn } from '../../utils/cn';

interface FilePreview {
  file: File;
  id: string;
  preview?: string;
}

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  acceptedTypes?: string;
  multiple?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  acceptedTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  multiple = true,
  className
}) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const filePreviews: FilePreview[] = [];

    for (const file of fileArray) {
      const preview = await generatePreview(file);
      filePreviews.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview
      });
    }

    const updatedFiles = multiple ? [...files, ...filePreviews] : filePreviews;
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={20} />;
    }
    return <FileText size={20} />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {files.length === 0 ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-component p-8 text-center transition-colors',
            isDragOver 
              ? 'border-campus-green bg-campus-green/5' 
              : 'border-glass-border hover:border-campus-green/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={48} className="mx-auto text-theme-text-muted mb-4" />
          <h4 className="text-lg font-medium text-theme-text mb-2">Upload Documents</h4>
          <p className="text-sm text-theme-text-secondary mb-4">
            Drag and drop your files here, or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <GlassButton
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </GlassButton>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((filePreview) => (
              <div
                key={filePreview.id}
                className="relative group bg-glass-bg backdrop-blur-glass border border-glass-border rounded-component p-3"
              >
                <button
                  onClick={() => removeFile(filePreview.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={14} />
                </button>
                
                <div className="aspect-square mb-2 rounded bg-theme-bg flex items-center justify-center overflow-hidden">
                  {filePreview.preview ? (
                    <img
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-theme-text-muted">
                      {getFileIcon(filePreview.file)}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-theme-text truncate" title={filePreview.file.name}>
                  {filePreview.file.name}
                </p>
                <p className="text-xs text-theme-text-secondary">
                  {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              accept={acceptedTypes}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <GlassButton
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              size="sm"
            >
              Add More Files
            </GlassButton>
            <GlassButton
              variant="danger"
              onClick={() => {
                setFiles([]);
                onFilesChange([]);
              }}
              size="sm"
            >
              Clear All
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
};