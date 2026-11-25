import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import NavBar from './NavBar';
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';
import EditModeBanner from './EditModeBanner';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-dark font-sans flex flex-col">
      <EditModeBanner />
      <TopBar />
      <NavBar />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
