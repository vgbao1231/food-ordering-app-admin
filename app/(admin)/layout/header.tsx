'use client';

import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLogoutMutation } from '@/features/auth/authApi';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Header({ setSidebarOpen }: any) {
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();
  const me = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    try {
      await logout().unwrap(); // Gọi API logout
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      // Chuyển hướng về trang login
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-card shadow-sm border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen((p: any) => !p)}
        >
          <Menu className="w-5 h-5 text-foreground" />
        </Button>

        {/* Page title */}
        <div className="flex-1 lg:flex-none">
          <h1 className="text-lg font-semibold text-foreground lg:hidden">
            Admin Dashboard
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {/* <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-foreground" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 center-both bg-red-600 text-white text-xs">
              3
            </Badge>
          </Button> */}

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 relative">
              <Image
                src={me?.avatar?.url || '/placeholder.svg'}
                alt="Avatar"
                width={40}
                height={40}
                className="object-cover rounded-full"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {me?.name || 'Admin'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {me?.email || 'admin@gmail.com'}
              </div>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4 text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
