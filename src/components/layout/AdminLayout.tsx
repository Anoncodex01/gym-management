import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart2,
  Users,
  Dumbbell,
  Calendar,
  Clock,
  CreditCard,
  Bell,
  Settings,
  LogIn,
  Gift,
  CalendarDays,
  ChevronDown
} from 'lucide-react';

interface MenuItem {
  path?: string;
  icon: React.ReactNode;
  label: string;
  children?: {
    path: string;
    icon: React.ReactNode;
    label: string;
  }[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { path: '/admin', icon: <BarChart2 className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/members', icon: <Users className="w-5 h-5" />, label: 'Members' },
    {
      icon: <Dumbbell className="w-5 h-5" />,
      label: 'Classes Management',
      children: [
        { path: '/admin/classes', icon: <Dumbbell className="w-5 h-5" />, label: 'Classes' },
        { path: '/admin/schedule', icon: <Calendar className="w-5 h-5" />, label: 'Schedule' },
        { path: '/admin/attendance', icon: <Clock className="w-5 h-5" />, label: 'Attendance' },
      ]
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Financial Management',
      children: [
        { path: '/admin/billing', icon: <CreditCard className="w-5 h-5" />, label: 'Billing' },
        { path: '/admin/subscriptions', icon: <CreditCard className="w-5 h-5" />, label: 'Subscriptions' },
      ]
    },
    { path: '/admin/member-signin', icon: <LogIn className="w-5 h-5" />, label: 'Member Sign In' },
    { path: '/admin/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
    { path: '/admin/holidays', icon: <CalendarDays className="w-5 h-5" />, label: 'Holidays' },
    { path: '/admin/birthday', icon: <Gift className="w-5 h-5" />, label: 'Birthday' },
    { path: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isExpanded = expandedMenus.includes(item.label);
    const isActive = item.path === location.pathname;
    const hasChildren = Boolean(item.children?.length);

    return (
      <div key={item.label}>
        {item.path ? (
          <Link
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
              isActive ? 'bg-gray-50' : ''
            }`}
          >
            <span className="text-gray-500">{item.icon}</span>
            <span className="ml-3 text-gray-600 font-medium">{item.label}</span>
          </Link>
        ) : (
          <>
            <button
              onClick={() => toggleMenu(item.label)}
              className={`w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                isExpanded ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="text-gray-500">{item.icon}</span>
                <span className="ml-3 text-gray-600 font-medium">{item.label}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isExpanded && item.children && (
              <div className="bg-gray-50">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`flex items-center pl-14 pr-6 py-2 text-gray-600 hover:bg-gray-100 ${
                      location.pathname === child.path ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="text-gray-500">{child.icon}</span>
                    <span className="ml-3 text-gray-600">{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white w-64 shadow-sm transform transition-transform duration-200 ease-in-out z-30 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-xl font-semibold text-gray-800">Gym Management</h1>
        </div>
        <nav className="mt-2">
          {menuItems.map(renderMenuItem)}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {!sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Main content */}
      <div className={`lg:ml-64 transition-margin duration-200 ease-in-out ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="w-6 h-6 text-gray-500" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};