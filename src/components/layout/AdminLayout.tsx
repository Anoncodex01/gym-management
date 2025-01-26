import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  CreditCard,
  Settings,
  Bell,
  BarChart,
  Clock,
  Dumbbell,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: <BarChart className="w-6 h-6" />, label: 'Dashboard' },
    { path: '/admin/members', icon: <Users className="w-6 h-6" />, label: 'Members' },
    { path: '/admin/classes', icon: <Dumbbell className="w-6 h-6" />, label: 'Classes' },
    { path: '/admin/analytics', icon: <BarChart className="w-6 h-6" />, label: 'Analytics' },
    { path: '/admin/schedule', icon: <Calendar className="w-6 h-6" />, label: 'Schedule' },
    { path: '/admin/billing', icon: <CreditCard className="w-6 h-6" />, label: 'Billing' },
    { path: '/admin/notifications', icon: <Bell className="w-6 h-6" />, label: 'Notifications' },
    { path: '/admin/settings', icon: <Settings className="w-6 h-6" />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white w-64 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} min-h-screen transition-all duration-200`}>
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="ml-4 text-lg font-medium">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};