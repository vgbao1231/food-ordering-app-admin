import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import 'leaflet/dist/leaflet.css';
import { ToastContainer } from 'react-toastify';
import Providers from '@/app/providers';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* TODO: sửa logo */}
        <link rel="icon" type="image/png" href="/logo.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ToastContainer autoClose={3000} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
