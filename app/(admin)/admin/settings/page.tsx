'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { cn, compressImage } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from '@/features/auth/authApi';
import { setUser } from '@/features/auth/authSlice';
import { useUploadImagesMutation } from '@/features/upload/uploadApi';

// Định nghĩa lại cấu trúc Image để tránh lỗi TypeScript
interface UserImage {
  url: string;
  filePath: string;
  createdAt?: string;
}

interface FormData {
  name: string;
  email: string;
  phonenumber: string;
  avatar: File | UserImage | null; // Cấu trúc dữ liệu cho image
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phonenumber?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

export default function ProfileSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false); // Trạng thái upload avatar riêng
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();
  const [uploadImage] = useUploadImagesMutation();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [formData, setFormData] = useState<FormData>({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phonenumber: currentUser?.phonenumber || '',
    avatar: (currentUser?.avatar as UserImage) || null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Đồng bộ hóa data khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        phonenumber: currentUser.phonenumber || '',
        avatar: (currentUser.avatar as UserImage) || null,
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
    });

  // Validation functions (Giữ nguyên)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phonenumber: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phonenumber.replace(/\s/g, ''));
  };

  const validatePasswordRequirements = (
    password: string
  ): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  };

  const isPasswordValid = (validation: PasswordValidation): boolean => {
    return (
      validation.minLength &&
      validation.hasUppercase &&
      validation.hasLowercase &&
      validation.hasNumber
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate phonenumber
    if (!formData.phonenumber.trim()) {
      newErrors.phonenumber = 'Số điện thoại không được để trống';
    } else if (!validatePhone(formData.phonenumber)) {
      newErrors.phonenumber = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    // Validate password change (only if user is trying to change password)
    if (
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword
    ) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      } else if (!isPasswordValid(passwordValidation)) {
        newErrors.newPassword = 'Mật khẩu chưa đáp ứng đủ yêu cầu';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time password validation
    if (field === 'newPassword') {
      const validation = validatePasswordRequirements(value);
      setPasswordValidation(validation);
    }

    // Clear error when user starts typing (narrow to FormErrors keys)
    const errorKey = field as keyof FormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
    }
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatar: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    // Khởi tạo payload cho API updateProfile
    const profilePayload: any = {
      name: formData.name,
      email: formData.email,
      phonenumber: formData.phonenumber || undefined,
      avatar: undefined,
    };

    setIsLoading(true);

    try {
      let finalImage: UserImage | null = null;

      // 1. Xử lý Upload Avatar MỚI
      if (formData.avatar instanceof File) {
        setIsUploadingAvatar(true); // Bắt đầu tải lên
        const compressedFile = await compressImage(formData.avatar);

        // Giả định useUploadImageMutation trả về { url, filePath } hoặc [ { url, filePath } ]
        const uploadRes = await uploadImage({
          files: [compressedFile], // Gửi file dưới dạng mảng (theo logic BE)
        }).unwrap();

        const uploadedFileDetail = Array.isArray(uploadRes)
          ? uploadRes[0]
          : uploadRes;

        // Map kết quả sang cấu trúc BE
        finalImage = {
          filePath: uploadedFileDetail.filePath,
          url: uploadedFileDetail.url,
          createdAt: new Date().toISOString(),
        };

        profilePayload.avatar = finalImage;
        setIsUploadingAvatar(false);
      } else if (formData.avatar && (formData.avatar as UserImage).url) {
        // 2. Giữ lại ảnh cũ (đã có đủ url và filePath)
        finalImage = formData.avatar as UserImage;
        profilePayload.avatar = finalImage;
      } else if (formData.avatar === null) {
        // 3. Xử lý trường hợp xóa ảnh
        profilePayload.avatar = null;
      }

      // 4. Gọi API Cập nhật Profile
      const profileResult = await updateProfile(profilePayload).unwrap();

      // 5. Xử lý Đổi Mật khẩu
      const isPasswordChangeAttempt =
        formData.currentPassword ||
        formData.newPassword ||
        formData.confirmPassword;

      if (isPasswordChangeAttempt) {
        const passwordData = {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmPassword, // Tên trường thường là confirmNewPassword
        };

        await changePassword(passwordData).unwrap();

        // Xóa trường mật khẩu sau khi đổi thành công
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));

        // Reset password validation
        setPasswordValidation({
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
        });

        toast.success('Cập nhật thông tin và mật khẩu thành công!');
      } else {
        // Chỉ cập nhật Profile
        toast.success('Cập nhật thông tin thành công!');
      }

      // 6. Cập nhật Redux store (sau khi profile update thành công)
      if (profileResult && profileResult.data) {
        dispatch(setUser(profileResult.data));
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Không thể cập nhật thông tin. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsUploadingAvatar(false); // Đảm bảo reset cả trạng thái upload avatar
    }
  };

  // ... (Phần render UI giữ nguyên, chỉ thay đổi logic bên trong)
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row gap-12">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 rounded-full overflow-hidden">
                <AvatarImage
                  src={
                    formData.avatar instanceof File
                      ? URL.createObjectURL(formData.avatar)
                      : formData.avatar?.url || '/placeholder.svg'
                  }
                  className="w-full h-full object-cover"
                  alt="User Avatar"
                />
              </Avatar>
              <div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUploadingAvatar || isLoading}
                  className="flex items-center gap-2"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {isUploadingAvatar ? 'Đang tải lên...' : 'Thay đổi ảnh'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG tối đa 2MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="grid gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ và tên"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phonenumber">Số điện thoại</Label>
                <Input
                  id="phonenumber"
                  placeholder="0123456789"
                  value={formData.phonenumber}
                  onChange={(e) =>
                    handleInputChange('phonenumber', e.target.value)
                  }
                  className={errors.phonenumber ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.phonenumber && (
                  <p className="text-sm text-red-500">{errors.phonenumber}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>
              Để trống nếu không muốn thay đổi mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    handleInputChange('currentPassword', e.target.value)
                  }
                  className={errors.currentPassword ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange('newPassword', e.target.value)
                  }
                  className={errors.newPassword ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}

              {/* Password Requirements - Show only when user starts typing */}
              {formData.newPassword && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Yêu cầu mật khẩu:
                  </p>
                  <PasswordRequirement
                    text="Ít nhất 8 ký tự"
                    isValid={passwordValidation.minLength}
                  />
                  <PasswordRequirement
                    text="Có ít nhất 1 chữ hoa (A-Z)"
                    isValid={passwordValidation.hasUppercase}
                  />
                  <PasswordRequirement
                    text="Có ít nhất 1 chữ thường (a-z)"
                    isValid={passwordValidation.hasLowercase}
                  />
                  <PasswordRequirement
                    text="Có ít nhất 1 số (0-9)"
                    isValid={passwordValidation.hasNumber}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}

              {/* Password Match Indicator */}
              {formData.confirmPassword && formData.newPassword && (
                <div className="mt-2">
                  <PasswordRequirement
                    text="Mật khẩu xác nhận khớp"
                    isValid={formData.newPassword === formData.confirmPassword}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PasswordRequirement({
  text,
  isValid,
}: {
  text: string;
  isValid: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        isValid ? 'text-green-600' : 'text-red-500'
      )}
    >
      {isValid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );
}
