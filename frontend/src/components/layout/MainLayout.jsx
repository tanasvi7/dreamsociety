import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout; 