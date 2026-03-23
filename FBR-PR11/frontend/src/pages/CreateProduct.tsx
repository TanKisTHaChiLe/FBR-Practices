import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../api/products";
import { ProductForm } from "../components/ProductForm";
import { CreateProductDTO } from "../types";
import toast from "react-hot-toast";

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateProductDTO) => {
    setIsLoading(true);
    try {
      const newProduct = await productsApi.create(data);
      toast.success("Товар создан!");
      navigate(`/products/${newProduct.id}`);
    } catch (error) {
      toast.error("Ошибка при создании товара");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText="Создать товар"
      />
    </div>
  );
};
