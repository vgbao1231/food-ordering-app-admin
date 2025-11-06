import React from 'react';
import '../globals.css';
import { ToastContainer } from 'react-toastify';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ToastContainer autoClose={3000} />
    </>
  );
}
