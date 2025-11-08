'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  EyeOff,
  Globe,
  MessageCircle,
  HelpCircle,
  Lock,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { useLoginMutation } from '@/features/auth/authApi';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      // Lưu token (session cookie)
      Cookies.set('accessToken', user.token);
      Cookies.set('refreshToken', user.refreshToken);

      // Nếu tick rememberMe → tạo flag
      if (formData.rememberMe) {
        Cookies.set('remember_me', 'true');
      } else {
        Cookies.remove('remember_me');
      }

      router.push('/admin/stores');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:w-1/3 bg-gradient-to-br from-[#e5712f] to-[#f03864] relative overflow-hidden">
        {/* Content */}
        <div className="relative z-10 flex flex-col px-8 py-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <Image src="/logo.png" alt="logo" width={100} height={100} />
          </div>

          {/* Main Text */}
          <h5 className="text-2xl lg:text-4xl font-semibold text-white leading-tight flex-1">
            Trao quyền cho các đại lý IQI, hợp lý hóa quy trình bất động sản
          </h5>

          {/* Illustration Area */}
          <div className="relative">
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
              className="absolute top-0 left-0 w-16 h-16 bg-yellow-300 rounded-2xl center-both shadow-lg"
            >
              <span className="text-2xl">📊</span>
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
              className="absolute top-4 right-0 w-14 h-14 bg-blue-400 rounded-xl center-both shadow-lg"
            >
              <span className="text-2xl">🏢</span>
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
              className="absolute bottom-0 left-4 w-12 h-12 bg-green-400 rounded-lg center-both shadow-lg"
            >
              <span className="text-lg">🚀</span>
            </motion.div>

            {/* Main Character */}
            <div className="flex justify-center mt-16">
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
                className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full center-both shadow-2xl"
              >
                <span className="text-6xl">🐯</span>
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
              }}
              className="absolute bottom-0 right-8 w-12 h-12 bg-purple-400 rounded-full center-both shadow-lg"
            >
              <span className="text-2xl">⭐</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg center-both">
                <span className="text-white font-bold text-sm">IQI</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>VI</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 center-both px-6">
          <div className="w-full max-w-lg">
            {/* Logo and Title */}
            <div className="text-center mb-8 center-both flex-col">
              {/* <Image src="/logo.png" alt="logo" width={100} height={100} /> */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Đăng nhập vào PTITFOOD ADMIN
              </h1>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="admin@iqi.com"
                    className="pl-10 placeholder:text-gray-400"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 placeholder:text-gray-400"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        rememberMe: checked as boolean,
                      })
                    }
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    Ghi nhớ tôi
                  </label>
                </div>
                <Link
                  href="/admin/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Đang đăng nhập' : 'ĐĂNG NHẬP'}
              </Button>
            </form>
          </div>
        </div>

        {/* Support Chat Button */}
        <div className="fixed bottom-6 right-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg center-both"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Help Button */}
        <div className="fixed bottom-6 right-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg center-both"
          >
            <HelpCircle className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
