// Đường dẫn giả định: src/app/(admin)/admin/categories/page.tsx

'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Plus, Search, Edit, Trash, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { FadeIn } from '@/components/common/animations';

import { formatDate } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import LoadingScreen from '@/components/common/loading-screen';
import { Pagination } from '@/components/ui/pagination';
import {
  SystemCategory,
  CategoryFormDialog,
} from './components/CategoryFormDialog'; // Import Interface và Dialog
import {
  useDeleteSystemCategoryMutation,
  useGetAllSystemCategoriesQuery,
} from '@/features/systemCategory/systemCategoryApi';

export default function SystemCategoryPage() {
  const { data: categoriesResponse, isLoading } =
    useGetAllSystemCategoriesQuery();
  const [deleteCategory] = useDeleteSystemCategoryMutation();

  // Kiểm tra cấu trúc response của bạn: data: getSystemCategory là mảng categories
  const categories: SystemCategory[] = categoriesResponse?.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedCategory, setSelectedCategory] =
    useState<SystemCategory | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCategories = categories.filter((item: SystemCategory) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  // Mở Dialog (null: Tạo mới, category: Chỉnh sửa)
  const handleOpenFormDialog = (category: SystemCategory | null = null) => {
    setSelectedCategory(category);
    setIsFormDialogOpen(true);
  };

  // Xử lý Xóa Danh mục
  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa danh mục "${name}"? Thao tác này không thể hoàn tác.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCategory(id).unwrap();
      // toast.success(`Đã xóa danh mục "${name}" thành công.`);
    } catch (error) {
      console.error('Lỗi xóa danh mục:', error);
      // toast.error('Xóa danh mục thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading)
    return <LoadingScreen loadingText="Đang tải danh mục hệ thống..." />;

  return (
    <div className="p-6 space-y-6">
      {/* 1. Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quản Lý Danh Mục Hệ Thống
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Thêm và quản lý các danh mục chính cho món ăn/sản phẩm
            </p>
          </div>
          {/* Nút Thêm Danh mục mới */}
          <Button onClick={() => handleOpenFormDialog(null)}>
            <Plus className="w-4 h-4" /> Thêm Danh Mục Mới
          </Button>
        </div>
      </FadeIn>

      {/* 2. Dialog Thêm/Sửa */}
      <CategoryFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        categoryData={selectedCategory}
      />

      {/* 3. Search */}
      <FadeIn delay={0.1}>
        <div className="flex space-x-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo Tên Danh Mục..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách Danh Mục ({filteredCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Ảnh</TableHead>
                    <TableHead className="min-w-[300px]">
                      Tên Danh Mục
                    </TableHead>
                    <TableHead className="">ID</TableHead>
                    <TableHead className="text-nowrap min-w-[120px]">
                      Ngày Tạo
                    </TableHead>
                    <TableHead className="text-center min-w-[100px]">
                      Thao Tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((category: SystemCategory) => {
                      const isDeleting = deletingId === category._id;

                      return (
                        <TableRow
                          key={category._id}
                          className="hover:bg-gray-50"
                        >
                          {/* Cột 1: Ảnh */}
                          <TableCell>
                            <Image
                              src={category.image.url || '/placeholder.svg'}
                              alt={category.name}
                              width={60}
                              height={60}
                              priority
                              className="object-cover aspect-square rounded"
                            />
                          </TableCell>

                          {/* Cột 2: Tên Danh Mục */}
                          <TableCell className="font-medium text-gray-900">
                            {category.name}
                          </TableCell>

                          {/* Cột 3: ID */}
                          <TableCell className="text-sm text-gray-600">
                            {category._id}
                          </TableCell>

                          {/* Cột 4: Ngày Tạo */}
                          <TableCell className="text-sm text-gray-600 text-nowrap">
                            {formatDate(category.image.createdAt ?? '')}
                          </TableCell>

                          {/* Cột 5: Thao Tác (Sửa/Xóa) */}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {/* 1. Nút SỬA */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-200"
                                onClick={() => handleOpenFormDialog(category)}
                                title="Chỉnh sửa"
                                disabled={isDeleting}
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>

                              {/* 2. Nút XÓA */}
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleDelete(category._id, category.name)
                                }
                                title="Xóa danh mục"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-gray-500"
                      >
                        Không tìm thấy danh mục hệ thống nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                paginatedStoresLength={paginatedCategories.length}
                filteredStoresLength={filteredCategories.length}
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
