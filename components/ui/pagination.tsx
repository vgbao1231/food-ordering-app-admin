import React from 'react';
import { Button } from '@/components/ui/button'; // Giả định component Button
import { cn } from '@/lib/utils';

// Số lượng nút tối đa hiển thị (bao gồm nút đầu/cuối và dấu ...)
const MAX_PAGE_BUTTONS = 7;

// Hàm tạo mảng các nút trang cần hiển thị (logic phân trang thông minh)
const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  maxButtons: number
) => {
  if (totalPages <= 1) return []; // Không cần phân trang

  // Nếu số trang ít hơn giới hạn, hiển thị tất cả
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range = [];
  const sideButtons = 1; // Số nút ở hai bên trang hiện tại
  const start = Math.max(2, currentPage - sideButtons);
  const end = Math.min(totalPages - 1, currentPage + sideButtons);

  // 1. Thêm nút 1
  range.push(1);

  // 2. Thêm dấu '...' đầu tiên
  if (start > 2) {
    range.push('...');
  }

  // 3. Thêm các nút xung quanh trang hiện tại
  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  // 4. Thêm dấu '...' thứ hai
  if (end < totalPages - 1) {
    range.push('...');
  }

  // 5. Thêm nút cuối
  if (range[range.length - 1] !== totalPages) {
    range.push(totalPages);
  }

  return range;
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  paginatedStoresLength: number; // Chiều dài mảng đã phân trang
  filteredStoresLength: number; // Chiều dài mảng đã lọc (Tổng số kết quả)
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
  paginatedStoresLength,
  filteredStoresLength,
}) => {
  const pageRange = getPaginationRange(
    currentPage,
    totalPages,
    MAX_PAGE_BUTTONS
  );

  if (totalPages <= 1) {
    return null; // Không hiển thị gì nếu chỉ có 1 trang
  }

  return (
    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      {/* Thông tin Trang */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Trang {currentPage} của {totalPages}
      </p>

      {/* Các Nút Điều hướng */}
      <div className="flex gap-2">
        {/* Nút Trước */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-10"
        >
          Trước
        </Button>

        {/* Render các Nút Trang Số */}
        <div className="flex items-center gap-1">
          {pageRange.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={index}
                  className="text-gray-600 dark:text-gray-400 px-2 select-none"
                >
                  ...
                </span>
              );
            }
            return (
              <Button
                key={index}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page as number)}
                // className={
                //   currentPage === page
                //     ? 'bg-orange-600 hover:bg-orange-700'
                //     : ''
                // }
                className={cn(
                  'w-8 h-10',
                  currentPage === page
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : ''
                )}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Nút Sau */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-10"
        >
          Sau
        </Button>
      </div>
    </div>
  );
};
