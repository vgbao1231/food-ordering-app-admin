'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AccountAccount } from '../page';
import {
  useCreateAccountMutation,
  useUpdateAccountInfoMutation,
} from '@/features/account/accountApi';
// Giả định toast được import và sử dụng ở đây

// Định nghĩa Schema validation với Zod
const adminFormSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.'),
  email: z.string().email('Email không hợp lệ.'),
  phonenumber: z.string().optional(), // Mật khẩu: Bắt buộc ở cấp độ Zod thấp nhất là optional,
  // logic bắt buộc/kiểm tra độ dài sẽ được xử lý trong onSubmit.
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự.')
    .optional()
    .or(z.literal('')),
});

// Định nghĩa Props
interface AccountDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accountData: AccountAccount | null;
}

export const AccountDetailDialog: React.FC<AccountDetailDialogProps> = ({
  isOpen,
  onClose,
  accountData,
}) => {
  // --- 1. HOOKS RTK QUERY ---
  const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
  const [updateAccountInfo, { isLoading: isUpdating }] =
    useUpdateAccountInfoMutation();

  const isEditMode = !!accountData;
  const isLoading = isCreating || isUpdating; // --- 2. CONFIG FORM ---

  const form = useForm<z.infer<typeof adminFormSchema>>({
    // Sử dụng resolver với schema cơ bản (password optional)
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phonenumber: '',
      password: '',
    },
  }); // Load dữ liệu khi ở chế độ chỉnh sửa

  useEffect(() => {
    if (isEditMode && accountData) {
      form.reset({
        name: accountData.name,
        email: accountData.email,
        phonenumber: accountData.phonenumber || '',
        password: '',
      });
    } else {
      form.reset();
    }
  }, [accountData, isEditMode, form]); // --- 3. SUBMIT HANDLER ---

  const onSubmit = async (values: z.infer<typeof adminFormSchema>) => {
    try {
      if (isEditMode && accountData) {
        // --- CHẾ ĐỘ CHỈNH SỬA (UPDATE) ---
        const dataToUpdate: any = {
          name: values.name,
          email: values.email,
          phonenumber: values.phonenumber || null, // Gửi null nếu trống để xóa
        };

        await updateAccountInfo({
          id: accountData._id,
          data: dataToUpdate,
        }).unwrap(); // toast.success('Cập nhật Account thành công!');
      } else {
        // --- CHẾ ĐỘ TẠO MỚI (CREATE) ---
        if (!values.password) {
          form.setError('password', {
            message: 'Mật khẩu là bắt buộc khi tạo mới.',
          });
          return;
        }

        const dataToCreate = {
          ...values, // password đã được kiểm tra và chắc chắn tồn tại
          phonenumber: values.phonenumber || undefined, // Đảm bảo gửi undefined nếu trống
        };

        await createAccount(dataToCreate).unwrap(); // toast.success('Tạo Account mới thành công!');
      }

      onClose();
      form.reset();
    } catch (error) {
      console.error('Lỗi thao tác Account:', error); // toast.error('Thao tác thất bại. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Chỉnh Sửa Tài Khoản' : 'Tạo Tài Khoản Mới'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên tài khoản</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phonenumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số Điện Thoại (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="0901234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEditMode && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật Khẩu*</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
                {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
