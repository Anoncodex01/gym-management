// src/components/admin/AdminLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  CreditCard,
  Settings,
  Bell,
  BarChart,
  Dumbbell,
  Gift,
  CalendarDays,
  LogIn
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
    { path: '/admin/schedule', icon: <Calendar className="w-6 h-6" />, label: 'Schedule' },
    { path: '/admin/attendance', icon: <Clock className="w-6 h-6" />, label: 'Attendance' },
    { path: '/admin/payments', icon: <CreditCard className="w-6 h-6" />, label: 'Payments' },
    { path: '/admin/subscriptions', icon: <CreditCard className="w-6 h-6" />, label: 'Subscriptions' },
    { path: '/admin/member-signin', icon: <LogIn className="w-6 h-6" />, label: 'Member Sign In' },
    { path: '/admin/notifications', icon: <Bell className="w-6 h-6" />, label: 'Notifications' },
    { path: '/admin/holiday', icon: <CalendarDays className="w-6 h-6" />, label: 'Holidays' },
    { path: '/admin/birthday', icon: <Gift className="w-6 h-6" />, label: 'Birthday' },
    { path: '/admin/settings', icon: <Settings className="w-6 h-6" />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white w-64 transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <h1 className="text-xl font-bold">Gym Management</h1>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${
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
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} min-h-screen transition-margin duration-200 ease-in-out`}>
        <header className="h-16 bg-white border-b px-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};