import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsApi } from "../api/products";
import { ProductForm } from "../components/ProductForm";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import { CreateProductDTO } from "../types";
import toast from "react-hot-toast";

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<
    CreateProductDTO | undefined
  >();

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const product = await productsApi.getById(productId);
      setInitialData({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
      });
    } catch (error) {
      setError("Ошибка при загрузке товара");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CreateProductDTO) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await productsApi.update(id, data);
      toast.success("Товар обновлен!");
      navigate(`/products/${id}`);
    } catch (error) {
      toast.error("Ошибка при обновлении товара");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !initialData) {
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
    <div className="max-w-3xl mx-auto">
      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        buttonText="Обновить товар"
      />
    </div>
  );
};
