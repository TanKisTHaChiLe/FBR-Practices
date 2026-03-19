import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(`${user.first_name} ${user.last_name}`);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const handleLogout = () => {
    authApi.logout();
    toast.success('Вы успешно вышли из системы', {
      icon: '👋',
      style: {
        background: '#363636',
        color: '#fff',
      },
    });
    navigate('/login');
  };

  const navigation = [
    { name: 'Все товары', href: '/products', icon: HomeIcon, current: location.pathname === '/products' },
    { name: 'Создать товар', href: '/products/create', icon: PlusCircleIcon, current: location.pathname === '/products/create' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Product Manager
            </h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{userName || 'Пользователь'}</p>
                      <p className="text-sm text-gray-500">Личный кабинет</p>
                    </div>
                  </div>
                </div>
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        item.current
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Выйти</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-50 lg:w-72">
        <div className="flex flex-col flex-1 min-h-0 bg-white/90 backdrop-blur-md border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Product Manager
              </h1>
            </div>
            
            <div className="px-6 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                  <UserCircleIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{userName || 'Пользователь'}</p>
                  <p className="text-sm text-primary-600">Активный сеанс</p>
                </div>
              </div>
            </div>

            <nav className="mt-5 flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    item.current
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-50 hover:scale-105'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Выйти из системы
            </button>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        <main className="py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};