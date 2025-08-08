import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      path: '/',
      active: location.pathname === '/',
    },
    {
      name: 'My Network',
      icon: Users,
      path: '/network',
      active: location.pathname.startsWith('/network'),
    },
    {
      name: 'Jobs',
      icon: Briefcase,
      path: '/jobs',
      active: location.pathname.startsWith('/jobs'),
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
              item.active
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
            } transition-colors duration-200`}
            aria-label={item.name}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.showBadge && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
              )}
            </div>
            <span className="text-xs mt-0.5">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
