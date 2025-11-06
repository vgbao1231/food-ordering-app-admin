'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Search, Ban, Check, Clock, Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { FadeIn } from '@/components/common/animations';
import {
  useApproveStoreMutation,
  useGetAllStoresQuery,
  useSuspendStoreMutation,
} from '@/features/store/storeApi';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import LoadingScreen from '@/components/common/loading-screen';
import { StoreDetailDialog } from '@/app/(admin)/admin/stores/components/StoreDetailDialog';
import { Pagination } from '@/components/ui/pagination';

export interface Store {
  _id: string;
  name: string;
  owner: string;
  address: { full_address: string; lat: number; lon: number };
  status: 'PENDING' | 'APPROVED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  avatar?: { filePath: string; url: string };
  cover?: { filePath: string; url: string };
  storeCategory: string[];
}

export default function StorePage() {
  const { data: stores, isLoading } = useGetAllStoresQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // const [deleteStore] = useDeleteStoreMutation();

  const filteredStores = (stores?.data ?? []).filter(
    (item: any) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.full_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  const getStatusBadge = (status: any) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 hover:bg-green-200"
          >
            Đã Duyệt
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          >
            Chờ Duyệt
          </Badge>
        );
      case 'BLOCKED':
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-700 hover:bg-red-200"
          >
            Tạm Khóa
          </Badge>
        );
      default:
        return <Badge variant="secondary">Không rõ</Badge>;
    }
  };

  const handleOpenDetailDialog = (store: Store) => {
    setSelectedStore(store);
    setIsDialogOpen(true);
  };

  const [approveStore, { isLoading: isApproving }] = useApproveStoreMutation();
  const [suspendStore, { isLoading: isSuspending }] = useSuspendStoreMutation();

  const handleApprove = async (store: Store) => {
    try {
      if (!store._id) return;
      await approveStore(store._id).unwrap();
      setSelectedStore(store);
    } catch (error) {
      console.error('Lỗi phê duyệt:', error);
    }
  };

  const handleSuspend = async (store: Store) => {
    try {
      if (!store._id) return;
      await suspendStore(store._id).unwrap();
      setSelectedStore(store);
    } catch (error) {
      console.error('Lỗi tạm khóa:', error);
    }
  };

  if (isLoading)
    return <LoadingScreen loadingText="Đang tải dữ liệu nhà hàng..." />;

  return (
    <div className="p-6 space-y-6">
      {/* 1. Header (Đã đổi tên và loại bỏ nút Thêm mới) */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quản Lý Đối Tác Nhà Hàng
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Duyệt đơn đăng ký, giám sát và quản lý trạng thái cửa hàng
            </p>
          </div>
        </div>
      </FadeIn>

      {/* 2. Dialog (Chỉ dùng cho Xem Chi Tiết và Thay đổi Trạng thái) */}
      {selectedStore && (
        <StoreDetailDialog
          store={selectedStore}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* 3. Search & Filters (Thêm bộ lọc trạng thái) */}
      <FadeIn delay={0.1}>
        <div className="flex space-x-4">
          {/* Thanh Tìm kiếm */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo Tên cửa hàng hoặc Địa chỉ..."
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
            <CardTitle>Danh sách nhà hàng ({filteredStores.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Ảnh</TableHead>
                    <TableHead className="min-w-[200px]">
                      Tên Cửa Hàng
                    </TableHead>
                    <TableHead className="">Địa Chỉ</TableHead>
                    <TableHead className="text-center min-w-[120px]">
                      Trạng Thái
                    </TableHead>
                    <TableHead className="text-nowrap min-w-[120px]">
                      Ngày Đăng Ký
                    </TableHead>
                    <TableHead className="text-center min-w-[120px]">
                      Thao Tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStores.length > 0 ? (
                    paginatedStores.map((store: any) => (
                      <TableRow key={store._id} className="hover:bg-gray-50">
                        {/* Cột 1: Ảnh */}
                        <TableCell>
                          <Image
                            src={store.avatar?.url || '/placeholder.svg'}
                            alt={store.name}
                            width={50}
                            height={50}
                            priority
                            className="object-cover aspect-square rounded-md overflow-hidden"
                          />
                        </TableCell>

                        {/* Cột 2: Tên Cửa Hàng */}
                        <TableCell className="font-medium text-gray-900">
                          {store.name}
                        </TableCell>

                        {/* Cột 3: Địa Chỉ */}
                        <TableCell className="text-sm text-gray-600">
                          {store.address.full_address}
                        </TableCell>

                        {/* Cột 4: Trạng Thái Duyệt */}
                        <TableCell className="text-center text-nowrap">
                          {getStatusBadge(store.status)}
                        </TableCell>

                        {/* Cột 5: Ngày Đăng Ký */}
                        <TableCell className="text-sm text-gray-600 text-nowrap">
                          {formatDate(store.createdAt)}
                        </TableCell>

                        {/* Cột 6: Thao Tác (Xem chi tiết & Thay đổi trạng thái) */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* 1. Xem Chi Tiết */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200"
                              onClick={() => handleOpenDetailDialog(store)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>

                            {/* 2. Phê Duyệt/Từ chối/Tạm khóa (Hành động chính) */}
                            {store.status === 'PENDING' && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleApprove(store)}
                                title="Phê duyệt"
                                disabled={
                                  selectedStore?._id === store._id &&
                                  isApproving
                                }
                              >
                                {selectedStore?._id === store._id &&
                                isApproving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                            )}

                            {store.status === 'APPROVED' && (
                              <Button
                                size="icon"
                                className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => handleSuspend(store)}
                                title="Tạm khóa"
                                disabled={
                                  selectedStore?._id === store._id &&
                                  isSuspending
                                }
                              >
                                {selectedStore?._id === store._id &&
                                isSuspending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                              </Button>
                            )}

                            {store.status === 'BLOCKED' && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => handleApprove(store)} // Khôi phục = Phê duyệt lại
                                title="Khôi phục"
                                disabled={
                                  selectedStore?._id === store._id &&
                                  isApproving
                                }
                              >
                                {selectedStore?._id === store._id &&
                                isApproving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-gray-500"
                      >
                        Không tìm thấy cửa hàng nào.
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
                paginatedStoresLength={paginatedStores.length}
                filteredStoresLength={filteredStores.length}
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
