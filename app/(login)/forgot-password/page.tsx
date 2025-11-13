'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Globe,
  MessageCircle,
  HelpCircle,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2, // Thêm Loader2 cho trạng thái loading
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
// ⚠️ Yêu cầu: Đảm bảo bạn đã cài đặt react-toastify
import { toast } from 'react-toastify';

// 1. IMPORT CÁC HOOKS MUTATION TỪ RTK QUERY
import {
  useCheckOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '@/features/auth/authApi';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Ẩn isLoading cục bộ, thay bằng loading state từ hook
  // const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. KHỞI TẠO CÁC MUTATION HOOKS
  const [forgotPassword, { isLoading: isSendingOtp }] =
    useForgotPasswordMutation();
  const [checkOtp, { isLoading: isVerifyingOtp }] = useCheckOtpMutation();
  const [resetPassword, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();

  const currentLoadingState =
    isSendingOtp || isVerifyingOtp || isResettingPassword;

  // 3. HÀM XỬ LÝ GỬI OTP (Bước 1)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập Email.');
      return;
    }

    try {
      // Gọi API forgotPassword (POST /auth/forgot-password)
      const response = await forgotPassword({ email }).unwrap();

      toast.success(
        response.message ||
          `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra email.`
      );
      setStep('otp'); // Chuyển sang bước 2
    } catch (err: any) {
      console.error('Send OTP failed:', err);
      // Xử lý lỗi BE trả về
      const message =
        err.data?.message || 'Gửi OTP thất bại. Vui lòng kiểm tra lại Email.';
      toast.error(message);
    }
  };

  // 4. HÀM XỬ LÝ XÁC NHẬN OTP (Bước 2)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Mã OTP phải có 6 chữ số.');
      return;
    }

    try {
      // Gọi API checkOTP (POST /auth/check-otp)
      // BE trả về string "OTP hợp lệ"
      await checkOtp({ email, otp }).unwrap();

      toast.success('Xác nhận OTP thành công. Vui lòng đặt lại mật khẩu.');
      setStep('password'); // Chuyển sang bước 3
    } catch (err: any) {
      console.error('Verify OTP failed:', err);
      // Xử lý lỗi BE trả về
      const message =
        err.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.';
      toast.error(message);
    }
  };

  // 5. HÀM XỬ LÝ ĐẶT LẠI MẬT KHẨU (Bước 3)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và mật khẩu xác nhận không khớp.');
      return;
    }
    if (!newPassword) {
      toast.error('Vui lòng nhập mật khẩu mới.');
      return;
    }

    try {
      // Gọi API resetPassword (PUT /auth/reset-password)
      // Payload: { email, newPassword }
      const response = await resetPassword({ email, newPassword }).unwrap();

      toast.success(
        response.message ||
          'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.'
      );
      // Chuyển hướng sau khi thành công
      window.location.href = '/admin/login';
    } catch (err: any) {
      console.error('Reset password failed:', err);
      const message =
        err.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-[#e5712f] to-[#f03864] relative overflow-hidden">
        {/* Content */}
        <div className="relative z-10 center-both flex-col px-8 py-16 w-full gap-24">
          {/* Logo */}
          <Image
            src="/food_app_logo_no_bgr.png"
            alt="logo"
            width={200}
            height={200}
          />

          {/* Illustration Area */}
          <div className="relative h-60 w-full">
            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
              className="absolute top-0 left-0 w-20 h-20 bg-red-300 rounded-2xl center-both shadow-lg"
            >
              <span className="text-5xl">🧋</span>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute top-4 right-0 w-16 h-16 bg-blue-400 rounded-xl center-both shadow-lg"
            >
              <span className="text-4xl">🍟</span>
            </motion.div>

            <motion.div
              animate={{
                y: [0, -12, 0],
                x: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: 2,
              }}
              className="absolute bottom-0 left-4 w-14 h-14 bg-green-400 rounded-lg center-both shadow-lg"
            >
              <span className="text-3xl">🍗</span>
            </motion.div>

            {/* Main Character */}
            <div className="flex justify-center mt-16">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
                className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full center-both shadow-2xl"
              >
                <span className="text-6xl">🍔</span>
              </motion.div>
            </div>

            {/* Additional floating elements */}
            <motion.div
              animate={{
                rotate: [0, 360, 0],
                y: [0, 8, 0],
              }}
              transition={{
                duration: 15,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
                delay: 0,
              }}
              className="absolute bottom-0 right-8 w-16 h-16 bg-purple-400 rounded-full center-both shadow-lg"
            >
              <span className="text-3xl">🍕</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PTIT Food</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>VI</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6">
          <div className="w-full max-w-lg mx-auto">
            {/* Step 1: Email */}
            {step === 'email' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Quên mật khẩu
                  </h1>
                  <p className="text-sm text-gray-600">
                    Nhập email của bạn để nhận mã OTP
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="email"
                        name="email"
                        placeholder="admin@gmail.com"
                        className="pl-10 placeholder:text-gray-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSendingOtp}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    // Cập nhật trạng thái loading
                    disabled={isSendingOtp}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang gửi...
                      </>
                    ) : (
                      'GỬI MÃ OTP'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại đăng nhập</span>
                  </Link>
                </div>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <>
                <div className="text-center mb-8">
                  <Image
                    src="/food_app_logo_no_bgr.png"
                    alt="food_app_logo_no_bgr"
                    width={100}
                    height={100}
                    className="mx-auto mb-4"
                  />
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Xác nhận mã OTP
                  </h1>
                  <p className="text-sm text-gray-600">
                    Chúng tôi đã gửi mã OTP đến{' '}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mã OTP (6 chữ số)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        name="otp"
                        placeholder="000000"
                        maxLength={6}
                        className="pl-10 placeholder:text-gray-400 text-center text-2xl tracking-widest"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        required
                        disabled={isVerifyingOtp}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    // Cập nhật trạng thái loading và điều kiện disabled
                    disabled={isVerifyingOtp || otp.length !== 6}
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang xác nhận...
                      </>
                    ) : (
                      'XÁC NHẬN'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  <p className="text-sm text-gray-600">Không nhận được mã?</p>
                  <button
                    // Gửi lại mã OTP sẽ gọi lại API forgotPassword
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:text-gray-400 disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Reset Password */}
            {step === 'password' && (
              <>
                <div className="text-center mb-8">
                  <Image
                    src="/food_app_logo_no_bgr.png"
                    alt="food_app_logo_no_bgr"
                    width={100}
                    height={100}
                    className="mx-auto mb-4"
                  />
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Đặt lại mật khẩu
                  </h1>
                  <p className="text-sm text-gray-600">
                    Nhập mật khẩu mới cho tài khoản của bạn
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        placeholder="••••••••"
                        className="pl-10 placeholder:text-gray-400"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isResettingPassword}
                      />
                      {/* Toggle Show Password */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isResettingPassword}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="••••••••"
                        className="pl-10 placeholder:text-gray-400"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isResettingPassword}
                      />
                    </div>
                    {/* Thêm cảnh báo nếu mật khẩu không khớp */}
                    {newPassword &&
                      confirmPassword &&
                      newPassword !== confirmPassword && (
                        <p className="mt-2 text-sm text-red-500">
                          Mật khẩu xác nhận không khớp!
                        </p>
                      )}
                  </div>

                  <Button
                    type="submit"
                    // Cập nhật trạng thái loading và điều kiện disabled
                    disabled={
                      isResettingPassword ||
                      newPassword !== confirmPassword ||
                      !newPassword ||
                      !confirmPassword
                    }
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang lưu...
                      </>
                    ) : (
                      'ĐẶT LẠI MẬT KHẨU'
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Support Chat Button */}
        <div className="fixed bottom-6 right-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Help Button */}
        <div className="fixed bottom-6 right-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center"
          >
            <HelpCircle className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
