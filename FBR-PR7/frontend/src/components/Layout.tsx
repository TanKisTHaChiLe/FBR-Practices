import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../api/auth";
import {
  HomeIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(`${user.first_name} ${user.last_name}`);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const handleLogout = () => {
    authApi.logout();
    toast.success("Вы вышли из системы");
    navigate("/login");
  };

  const navigation = [
    {
      name: "Все товары",
      href: "/products",
      icon: HomeIcon,
      current: location.pathname === "/products",
    },
    {
      name: "Создать товар",
      href: "/products/create",
      icon: PlusCircleIcon,
      current: location.pathname === "/products/create",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="lg:hidden">
        <div className="nav-bar fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold text-accent-400">ShopManager</h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-accent-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-accent-300" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-dark-900/95 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed right-0 top-0 bottom-0 w-64 bg-dark-800 shadow-2xl border-l border-dark-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="avatar p-3">
                      <UserCircleIcon className="h-8 w-8 text-dark-900" />
                    </div>
                    <div>
                      <p className="font-medium text-accent-300">
                        {userName || "Пользователь"}
                      </p>
                      <p className="text-xs text-dark-400">Личный кабинет</p>
                    </div>
                  </div>
                </div>
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        item.current
                          ? "bg-accent-400/20 text-accent-300 border border-accent-400/30"
                          : "text-dark-300 hover:bg-dark-700/50 hover:text-accent-300"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <div className="divider my-4" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-light-400 hover:bg-dark-700/50 transition-all"
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
        <div className="nav-bar flex flex-col flex-1 min-h-0 border-r border-dark-600">
          <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
            <div className="px-6 mb-8">
              <h1 className="text-2xl font-bold text-accent-400">
                ShopManager
              </h1>
              <p className="text-xs text-dark-400">Управление товарами</p>
            </div>

            <div className="px-4 mb-8">
              <div className="p-4 bg-dark-800/50 rounded-2xl border border-dark-600">
                <div className="flex items-center space-x-3">
                  <div className="avatar p-3">
                    <UserCircleIcon className="h-8 w-8 text-dark-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-accent-300">
                      {userName || "Пользователь"}
                    </p>
                    <p className="text-xs text-dark-400">Активный сеанс</p>
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    item.current
                      ? "bg-accent-400/10 text-accent-300 border border-accent-400/30"
                      : "text-dark-300 hover:bg-dark-800/50 hover:text-accent-300"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current
                        ? "text-accent-400"
                        : "text-dark-400 group-hover:text-accent-400"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-shrink-0 p-4 border-t border-dark-600">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-light-400 hover:bg-dark-800/50 rounded-xl transition-all group"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        <main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};
