'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Search, User, Edit } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import LoadingScreen from '@/components/common/loading-screen';
import { Pagination } from '@/components/ui/pagination';
import { useGetAllAccountsQuery } from '@/features/account/accountApi';
import { AccountDetailDialog } from '@/app/(admin)/admin/accounts/components/AccountDetailDialog';

export interface AccountAccount {
  _id: string;
  name: string;
  email: string;
  phonenumber?: string;
  role: string[];
  createdAt: string;
  updatedAt: string;
  avatar?: { filePath?: string; url: string };
}

export default function AccountAccountPage() {
  const { data: admins, isLoading } = useGetAllAccountsQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountAccount | null>(
    null
  );

  const filteredAccounts = (admins?.data ?? []).filter(
    (item: AccountAccount) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const handleOpenFormDialog = (account: AccountAccount | null = null) => {
    setSelectedAccount(account);
    setIsDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge
            variant="secondary"
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          >
            Quản trị viên
          </Badge>
        );
      case 'owner':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 hover:bg-amber-200"
          >
            Chủ nhà hàng
          </Badge>
        );
      case 'manager':
        return (
          <Badge
            variant="secondary"
            className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
          >
            Quản lý
          </Badge>
        );
      case 'staff':
        return (
          <Badge
            variant="secondary"
            className="bg-teal-100 text-teal-700 hover:bg-teal-200"
          >
            Nhân viên
          </Badge>
        );
      case 'user':
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Khách hàng
          </Badge>
        );
      default:
        return <Badge variant="secondary">Không rõ</Badge>;
    }
  };

  if (isLoading)
    return <LoadingScreen loadingText="Đang tải dữ liệu tài khoản..." />;

  return (
    <div className="p-6 space-y-6">
      {/* 1. Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quản Lý Tài Khoản Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Thêm, giám sát và quản lý quyền truy cập của nhân viên hệ thống
            </p>
          </div>
          {/* Nút Thêm Account mới */}
          <Button onClick={() => handleOpenFormDialog()}>
            <User className="w-4 h-4 mr-2" /> Thêm Account Mới
          </Button>
        </div>
      </FadeIn>

      {/* 2. Dialog (Có thể dùng cho Tạo/Sửa/Xem chi tiết Account) */}
      <AccountDetailDialog
        accountData={selectedAccount}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      {/* 3. Search & Filters */}
      <FadeIn delay={0.1}>
        <div className="flex space-x-4">
          {/* Thanh Tìm kiếm */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo Tên hoặc Email Account..."
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
              Danh sách tài khoản ({filteredAccounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Ảnh</TableHead>
                    <TableHead className="min-w-[200px]">
                      Tên Tài Khoản
                    </TableHead>
                    <TableHead className="">Email</TableHead>
                    <TableHead className="text-nowrap">Số Điện Thoại</TableHead>
                    <TableHead className="text-center min-w-[120px]">
                      Vai Trò
                    </TableHead>
                    <TableHead className="text-nowrap min-w-[120px]">
                      Ngày Tạo
                    </TableHead>
                    <TableHead className="text-center min-w-[120px]">
                      Thao Tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.length > 0 ? (
                    paginatedAccounts.map((account: AccountAccount) => {
                      const isCurrentAccountLoading =
                        selectedAccount?._id === account._id;

                      return (
                        <TableRow
                          key={account._id}
                          className="hover:bg-gray-50"
                        >
                          {/* Cột 1: Ảnh */}
                          <TableCell>
                            <Image
                              src={account.avatar?.url || '/placeholder.svg'}
                              alt={account.name}
                              width={40}
                              height={40}
                              priority
                              className="object-cover aspect-square rounded-full overflow-hidden"
                            />
                          </TableCell>

                          {/* Cột 2: Tên Tài Khoản */}
                          <TableCell className="font-medium text-gray-900">
                            {account.name}
                          </TableCell>

                          {/* Cột 3: Email */}
                          <TableCell className="text-sm text-gray-600">
                            {account.email}
                          </TableCell>

                          {/* Cột 4: Số Điện Thoại */}
                          <TableCell className="text-sm text-gray-600 text-nowrap">
                            {account.phonenumber || 'N/A'}
                          </TableCell>

                          {/* Cột 5: Vai Trò */}
                          <TableCell className="text-center">
                            {account.role.map((r) => getRoleBadge(r))}
                          </TableCell>

                          {/* Cột 7: Ngày Tạo */}
                          <TableCell className="text-sm text-gray-600 text-nowrap">
                            {formatDate(account.createdAt)}
                          </TableCell>

                          {/* Cột 8: Thao Tác (Khóa/Mở Khóa) */}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {/* Chỉnh sửa */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-200"
                                onClick={() => handleOpenFormDialog(account)}
                                title="Chỉnh sửa thông tin"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-gray-500"
                      >
                        Không tìm thấy tài khoản Account nào.
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
                paginatedStoresLength={paginatedAccounts.length}
                filteredStoresLength={filteredAccounts.length}
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
