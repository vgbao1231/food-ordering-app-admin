'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  useCreateSystemCategoryMutation,
  useUpdateSystemCategoryMutation,
} from '@/features/systemCategory/systemCategoryApi';
import { FileUpload } from '@/components/ui/file-upload';
import { Label } from '@/components/ui/label';
import { compressImage, diffPayload } from '@/lib/utils';
import { useUploadImagesMutation } from '@/features/upload/uploadApi';

export interface SystemCategory {
  _id: string;
  name: string;
  image: {
    filePath?: string;
    url: string;
    createdAt?: string;
  };
  createdAt: string;
}

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryData: SystemCategory | null;
}

type ImageState = SystemCategory['image'] | File | null;

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onClose,
  categoryData,
}) => {
  const [createCategory, { isLoading: isCreating }] =
    useCreateSystemCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateSystemCategoryMutation();

  const [uploadImage, { isLoading: isUploading }] = useUploadImagesMutation();

  const isEditMode = !!categoryData;
  const isLoading = isCreating || isUpdating || isUploading;

  const [formData, setFormData] = useState<{
    name: string;
    image: ImageState;
  }>({
    name: '',
    image: null,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: categoryData?.name || '',
        image: categoryData?.image || null,
      });
      setValidationError(null);
    }
  }, [isOpen, categoryData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.name) {
      setValidationError('Tên danh mục không được để trống.');
      return;
    }

    let finalImage: SystemCategory['image'] | undefined;

    try {
      if (formData.image instanceof File) {
        const compressedFile = await compressImage(formData.image);

        const uploadRes = await uploadImage({
          files: [compressedFile],
        }).unwrap();

        const uploadedFileDetail = uploadRes[0];

        finalImage = {
          filePath: uploadedFileDetail.filePath,
          url: uploadedFileDetail.url,
          createdAt: new Date().toISOString(),
        };
      } else if (formData.image && formData.image.url) {
        finalImage = formData.image;
      } else {
        setValidationError('Vui lòng cung cấp ảnh đại diện cho danh mục.');
        return;
      }

      let payload: any = diffPayload(
        {
          name: formData.name,
          image: finalImage,
        },
        categoryData
      );

      if (finalImage && !payload.image) {
        payload.image = finalImage;
      }

      if (categoryData) {
        await updateCategory({ id: categoryData._id, data: payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }

      onClose();
    } catch (error: any) {
      console.error(
        `Error ${categoryData ? 'editing' : 'creating'} category:`,
        error
      );

      setValidationError(
        error?.data?.message ||
          error?.message ||
          'Có lỗi xảy ra trong quá trình xử lý.'
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? 'Chỉnh Sửa Danh Mục Hệ Thống'
              : 'Thêm Danh Mục Hệ Thống Mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên Danh Mục */}
          <div>
            <Label htmlFor="name">Tên danh mục *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nhập tên danh mục..."
              required
              disabled={isLoading}
            />
          </div>

          {/* Ảnh Đại Diện (FileUpload Component của bạn) */}
          <div>
            <FileUpload
              label="Ảnh danh mục*"
              value={formData.image}
              onChange={(file) => {
                setFormData({ ...formData, image: file });
                setValidationError(null);
              }}
              placeholder={
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb">
                    Tải ảnh danh mục
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP (tối đa 5MB)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Khuyến nghị: 800x400px
                  </p>
                </div>
              }
            />
            {validationError && (
              <p className="text-sm font-medium text-red-500 mt-2">
                {validationError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Danh Mục'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
