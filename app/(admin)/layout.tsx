'use client';

import type React from 'react';
import '../globals.css';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { cn, decodeJwtPayload } from '@/lib/utils';
import Header from './layout/header';
import Sidebar from './layout/sidebar';
import { ThemeProvider } from '@/components/common/theme-provider';
import { useMeQuery } from '@/features/auth/authApi';
import { setUser, clearUser } from '@/features/auth/authSlice';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const accessToken = Cookies.get('accessToken');
  const userInfo = decodeJwtPayload(accessToken);

  const userId = userInfo?.id;
  const dispatch = useDispatch();

  const {
    data: user,
    isLoading,
    error,
  } = useMeQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    } else if (error) {
      dispatch(clearUser());

      Cookies.remove('accessToken');
    } else if (!userId) {
      dispatch(clearUser());
    }
  }, [user, error, dispatch, userId]);

  return (
    <ThemeProvider attribute="class" value={{ light: 'light' }}>
      <div className="min-h-screen bg-background light">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <div
          className={cn(
            'transition-all duration-300',
            sidebarOpen ? 'pl-64' : 'pl-0'
          )}
        >
          {/* Top header */}
          <Header setSidebarOpen={setSidebarOpen} />

          {/* Page content */}
          <main className="flex-1 text-foreground">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
