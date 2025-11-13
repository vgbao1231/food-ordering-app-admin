'use client';

import type React from 'react';
import '../globals.css';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Header from './layout/header';
import Sidebar from './layout/sidebar';
import { ThemeProvider } from '@/components/common/theme-provider';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
