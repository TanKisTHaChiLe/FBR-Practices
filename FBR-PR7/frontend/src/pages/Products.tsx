import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../api/products";
import { Product } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, products]);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);

      const uniqueCategories = [...new Set(data.map((p) => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      setError("Ошибка при загрузке товаров");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Удалить товар "${name}"?`)) {
      return;
    }

    try {
      await productsApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Товар удален");
    } catch (error) {
      toast.error("Ошибка при удалении товара");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="title text-3xl">Каталог товаров</h1>
          <p className="text-dark-400 mt-2">Управление ассортиментом</p>
        </div>
        <Link to="/products/create" className="btn-primary group">
          <PlusIcon className="h-5 w-5 inline mr-2 group-hover:rotate-90 transition-transform" />
          Добавить товар
        </Link>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input pl-10 appearance-none"
            >
              <option value="all">Все категории</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="text-right text-dark-400 self-center">
            Найдено:{" "}
            <span className="font-bold text-accent-400">
              {filteredProducts.length}
            </span>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="card p-16 text-center">
          <h3 className="text-xl font-semibold text-accent-300 mb-2">
            Товары не найдены
          </h3>
          <p className="text-dark-400 mb-6">
            Попробуйте изменить параметры поиска
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
            }}
            className="btn-secondary"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="card group hover:scale-105 transition-transform duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-3 py-1 bg-accent-400/10 border border-accent-400/30 text-accent-300 rounded-full text-xs font-semibold">
                    {product.category}
                  </span>
                  <span className="text-2xl font-bold text-accent-400">
                    {product.price.toLocaleString()} ₽
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-accent-300 mb-2 group-hover:text-accent-200 transition-colors">
                  {product.title}
                </h3>

                <p className="text-dark-400 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="text-xs text-dark-500 mb-4">
                  {format(new Date(product.createdAt), "dd MMMM yyyy", {
                    locale: ru,
                  })}
                </div>

                <div className="flex justify-end space-x-2 border-t border-dark-700 pt-4">
                  <Link
                    to={`/products/${product.id}`}
                    className="p-2 text-light-400 hover:bg-light-400/10 rounded-lg transition-colors"
                    title="Просмотр"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                  <Link
                    to={`/products/${product.id}/edit`}
                    className="p-2 text-accent-400 hover:bg-accent-400/10 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.title)}
                    className="p-2 text-light-600 hover:bg-light-600/10 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
