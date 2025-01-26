import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  User, 
  LogOut,
  Dumbbell
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <Home className="w-6 h-6" />, label: 'Dashboard' },
    { path: '/classes', icon: <Dumbbell className="w-6 h-6" />, label: 'Classes' },
    { path: '/membership/plans', icon: <CreditCard className="w-6 h-6" />, label: 'Membership' },
    { path: '/profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 bg-white w-64 border-r">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold">Gym Manager</h1>
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
          <button
            className="w-full flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50"
            onClick={() => {/* Add logout handler */}}
          >
            <LogOut className="w-6 h-6" />
            <span className="ml-3">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <header className="h-16 bg-white border-b px-6 flex items-center">
          <h2 className="text-lg font-medium">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};