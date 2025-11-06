'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, ImageIcon, ImagePlus } from 'lucide-react';
import { memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label?: string;
  value: any;
  onChange: (file: File | null) => void;
  accept?: string;
  clickToDelete?: boolean;
  className?: string;
  placeholder?: string | React.ReactNode;
}

export const FileUpload = memo(function FileUpload({
  label,
  value,
  onChange,
  accept = 'image/*',
  clickToDelete = false,
  className,
  placeholder,
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleImageClick = () => {
    if (clickToDelete && value) {
      // If clickToDelete is enabled and there's an image, delete it
      onChange(null);
    }
  };

  // Determine the image source based on whether value is a string (path) or a File object
  const imgSrc =
    value instanceof File
      ? URL.createObjectURL(value)
      : value?.url || '/placeholder.svg';
  const fileName =
    value instanceof File
      ? value.name
      : value?.url?.split('/').pop() || 'placeholder';

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          'border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors',
          className
        )}
      >
        {value ? (
          <div className="flex flex-col items-center space-y-2">
            {/* Check if it's an image type before rendering img tag */}
            {(value instanceof File ||
              (value && typeof value === 'object' && 'url' in value)) && (
              <div
                className={`relative group ${clickToDelete ? 'cursor-pointer' : ''}`}
                onClick={clickToDelete ? handleImageClick : undefined}
                title={clickToDelete ? 'Click để xóa ảnh' : undefined}
              >
                <Image
                  src={imgSrc || '/placeholder.svg'}
                  alt="Preview"
                  width={0}
                  height={0}
                  sizes="100vw"
                  quality={40}
                  priority
                  className="max-h-24 w-auto h-auto max-w-full rounded-md object-contain"
                />
                {clickToDelete && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all center-both rounded-md">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 w-6 h-6 rounded-full text-xs font-medium center-both">
                      X
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between w-full px-2 text-gray-300">
              <div className="flex-grow flex-shrink min-w-0 center-both space-x-2">
                <ImageIcon className="h-4 w-4 flex-none" />
                <span className="flex-grow max-w-60 truncate">{fileName}</span>
              </div>
              {!clickToDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(null)}
                  className="flex-none"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center space-y-2 text-muted-foreground">
              {/* <Upload className="h-8 w-8 text-gray-400" /> */}
              <ImagePlus className="w-12 h-12 text-gray-400" />
              {placeholder ||
                (label && (
                  <span className="text-sm">Tải lên {label.toLowerCase()}</span>
                ))}
            </div>
          </label>
        )}
      </div>
    </div>
  );
});
