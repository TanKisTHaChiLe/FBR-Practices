import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productsApi } from "../api/products";
import { Product } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const data = await productsApi.getById(productId);
      setProduct(data);
    } catch (error) {
      setError("Ошибка при загрузке товара");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    if (!window.confirm(`Удалить товар "${product.title}"?`)) {
      return;
    }

    try {
      await productsApi.delete(product.id);
      toast.success("Товар удален");
      navigate("/products");
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

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert
          type="error"
          message={error || "Товар не найден"}
          onClose={() => navigate("/products")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center text-accent-400 hover:text-accent-300 transition-colors group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Назад к списку
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-dark-800 to-dark-700 px-8 py-6 border-b border-dark-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-accent-300 text-sm">
                  ID: {product.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-accent-300 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center text-dark-300">
                <TagIcon className="h-4 w-4 mr-1" />
                <span>{product.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-accent-300 mb-4 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-accent-400 mr-2" />
                  Цена
                </h2>
                <p className="text-4xl font-bold text-accent-400">
                  {product.price.toLocaleString()} ₽
                </p>
              </div>

              <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-accent-300 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-accent-400 mr-2" />
                  Информация
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-dark-400">Создан:</span>
                    <p className="font-medium text-accent-300">
                      {format(
                        new Date(product.createdAt),
                        "dd MMMM yyyy, HH:mm",
                        { locale: ru },
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-dark-400">Обновлен:</span>
                    <p className="font-medium text-accent-300">
                      {format(
                        new Date(product.updatedAt),
                        "dd MMMM yyyy, HH:mm",
                        { locale: ru },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-accent-300 mb-4">
                  Описание
                </h2>
                <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-accent-300 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 text-accent-400 mr-2" />
                  Продавец
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="avatar p-2">
                    <UserIcon className="h-6 w-6 text-dark-900" />
                  </div>
                  <div>
                    <p className="text-accent-300">
                      ID: {product.userId.slice(0, 16)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-dark-700">
            <Link to={`/products/${product.id}/edit`} className="btn-primary">
              <PencilIcon className="h-5 w-5 inline mr-2" />
              Редактировать
            </Link>
            <button
              onClick={handleDelete}
              className="btn-secondary hover:bg-red-900/20 hover:border-red-700 hover:text-red-300"
            >
              <TrashIcon className="h-5 w-5 inline mr-2" />
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
