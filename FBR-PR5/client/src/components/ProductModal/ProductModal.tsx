import { useEffect, useState } from "react";
import type { IProduct } from "../ProductItem/ProductItem";
import styles from "./ProductModal.module.css"; // Импорт CSS-модуля

interface IProductData {
  id?: number | string;
  method: "POST" | "PUT";
  title: string;
  category: string;
  description: string;
  price: string;
  quantity: string;
}

interface IModal {
  open: boolean;
  title: string;
  product?: IProduct | null;
  onSubmit: (data: IProductData) => void;
  onClose: () => void;
}

export const ProductModal = ({
  open,
  title,
  product,
  onSubmit,
  onClose,
}: IModal) => {
  const [prTitle, setPrTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    setPrTitle(product?.title ?? "");
    setCategory(product?.category ?? "");
    setDescription(product?.description ?? "");
    setPrice(product?.price ?? "");
    setQuantity(product?.quantity ?? "");
  }, [product]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      ...(product?.id && { id: product.id }),
      method: product ? "PUT" : "POST",
      title: prTitle,
      category: category,
      description: description,
      price: price,
      quantity: quantity,
    });

    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              Заголовок
            </label>
            <input
              id="title"
              className={styles.input}
              type="text"
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              placeholder="Введите заголовок"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="category">
              Категория
            </label>
            <input
              id="category"
              className={styles.input}
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Введите категорию"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">
              Описание
            </label>
            <textarea
              id="description"
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание"
              rows={3}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">
              Цена
            </label>
            <input
              id="price"
              className={styles.input}
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="quantity">
              Количество
            </label>
            <input
              id="quantity"
              className={styles.input}
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              {product ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
