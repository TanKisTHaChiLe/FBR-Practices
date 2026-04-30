import React, { useState } from "react";
import { CreateProductDTO } from "../types";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface ProductFormProps {
  initialData?: Partial<CreateProductDTO>;
  onSubmit: (data: CreateProductDTO) => Promise<void>;
  isLoading: boolean;
  buttonText?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading,
  buttonText = "Сохранить",
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    price: initialData.price || 0,
    category: initialData.category || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 card p-8">
      <h2 className="text-2xl font-bold text-accent-400">
        {buttonText === "Обновить товар"
          ? "Редактирование товара"
          : "Новый товар"}
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Название <span className="text-light-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="input"
            placeholder="Введите название"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Категория <span className="text-light-400">*</span>
          </label>
          <input
            type="text"
            id="category"
            required
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="input"
            placeholder="Введите категорию"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Цена <span className="text-light-400">*</span>
          </label>
          <input
            type="number"
            id="price"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            className="input"
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Описание <span className="text-light-400">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="input resize-none"
            placeholder="Введите описание товара"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-dark-700">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-secondary"
          disabled={isLoading}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary min-w-[120px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
              Сохранение...
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </form>
  );
};
