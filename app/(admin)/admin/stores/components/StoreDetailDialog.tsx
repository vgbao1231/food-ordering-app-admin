import Image from 'next/image';
import { MapPin, User, Clock, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';
import { useGetStoreByIdQuery } from '@/features/store/storeApi';
import { Store } from '@/app/(admin)/admin/stores/page';

interface StoreDetailDialogProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  getStatusBadge: (status: string) => ReactNode;
}

export const StoreDetailDialog = ({
  store,
  isOpen,
  onClose,
  getStatusBadge,
}: StoreDetailDialogProps) => {
  const storeId = store._id;

  const { data: storeDetailResponse, isLoading } = useGetStoreByIdQuery(
    storeId,
    {
      skip: !isOpen,
      selectFromResult: ({ data, ...rest }) => ({
        data: data?.data as Store,
        ...rest,
      }),
    }
  );

  const storeDetail = storeDetailResponse;

  const getCategoryName = (category: any): string => {
    if (typeof category === 'object' && category !== null && category.name) {
      return category.name;
    }
    return `Danh mục ${String(category).slice(-4)}`;
  };

  const renderContent = () => {
    if (isLoading || !storeDetail) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
          <p className="text-gray-500">Đang tải chi tiết cửa hàng...</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột 1: Hình ảnh */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> Ảnh Đại Diện
            </h3>
            {/* Dùng dữ liệu cơ bản (store) cho avatar nếu nó giống nhau */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <Image
                src={store.avatar?.url || '/placeholder.svg'}
                alt="Store Avatar"
                layout="fill"
                objectFit="cover"
              />
            </div>

            <h3 className="font-semibold flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> Ảnh Bìa
            </h3>
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border">
              {/* Dùng dữ liệu chi tiết (storeDetail) */}
              <Image
                src={storeDetail.cover?.url || '/placeholder.svg'}
                alt="Store Cover"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>

          {/* Cột 2 & 3: Thông tin chi tiết */}
          <div className="md:col-span-2 space-y-6">
            {/* 1. Thông tin Chung (Sử dụng storeDetail) */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-1">
                Thông Tin Chung
              </h3>
              <p className="text-sm flex items-start">
                <MapPin className="w-4 h-4 mt-1 mr-2 flex-shrink-0 text-orange-500" />
                <span className="font-medium mr-1">Địa chỉ:</span>{' '}
                {storeDetail.address?.full_address}
              </p>
              <p className="text-sm flex items-center">
                <User className="w-4 h-4 mr-2 flex-shrink-0 text-orange-500" />
                <span className="font-medium mr-1">ID Chủ sở hữu:</span>{' '}
                {storeDetail.owner}
              </p>
              <p className="text-sm flex items-center">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-orange-500" />
                <span className="font-medium mr-1">Ngày Đăng Ký:</span>{' '}
                {formatDate(storeDetail.createdAt)}
              </p>
            </div>

            {/* 2. Phân loại */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-1">Phân Loại</h3>
              <div className="flex flex-wrap gap-2">
                {storeDetail.storeCategory?.map((cat: any) => (
                  <Badge
                    key={cat._id || cat}
                    variant="outline"
                    className="text-sm"
                  >
                    {getCategoryName(cat)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 3. Google Map */}
            {storeDetail.address?.lat && storeDetail.address?.lon && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg border-b pb-1">
                  Vị Trí Cửa Hàng
                </h3>
                <div className="w-full aspect-[5/3] rounded-lg overflow-hidden border">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${storeDetail.address.lat},${storeDetail.address.lon}&hl=vi&z=16&output=embed`}
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header Dùng Dữ liệu Prop (Hiển thị ngay lập tức) */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-4">
            {store.name}
            {getStatusBadge(store.status)}
          </DialogTitle>
          <DialogDescription>Chi tiết thông tin nhà hàng</DialogDescription>
        </DialogHeader>

        {/* Nội dung Dùng Hàm Render (Loading/Data) */}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
