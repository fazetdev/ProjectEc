'use client';

import { Package, PlusCircle, Home, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '/add-product', label: 'Add Shoe', icon: PlusCircle },
  ];

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem('fazet_auth');
    // Redirect to home
    router.push('/');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Minimal Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">F</span>
              </div>
            </div>
            <div className="ml-2">
              <h1 className="text-sm font-bold text-white">Fazet Business</h1>
            </div>
          </div>

          {/* Desktop Navigation - ALL 3 ITEMS */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1.5 rounded text-sm font-medium text-gray-300 hover:bg-red-900/30 hover:text-red-300 ml-1 border border-gray-700"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Logout
            </button>
          </nav>

          {/* Mobile Navigation - ALL 3 ITEMS */}
          <nav className="md:hidden flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-2 py-1 rounded text-xs font-medium
                    ${isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="h-3 w-3" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Labels - ALL 3 ITEMS */}
        <div className="md:hidden border-t border-gray-800 py-1.5">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    text-xs font-medium
                    ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-300'}
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
