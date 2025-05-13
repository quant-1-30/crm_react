import React from 'react';
import { Outlet } from 'react-router-dom';
import { LogoutButton } from '../components/context';

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <header className="p-4 bg-gray-100 flex justify-between items-center shadow">
      <div className="text-xl font-bold">客户管理系统</div>
      {/* <LogoutButton /> */}
      <div className="ml-auto"> {/* This will push the LogoutButton to the right */}
        <LogoutButton />
      </div>
    </header>
    <main className="flex-1 p-4">
      {/* Outlet 会渲染子路由对应的页面 */}
      <Outlet />
    </main>
  </div>
);

export default Layout;
