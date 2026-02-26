import styles from "./ProductItem.module.css";

export interface IProduct {
  id: number;
  title: string;
  category: string;
  description: string;
  price: string;
  quantity: string;
}

interface IProductItem {
  product: IProduct;
  openEdit: (product: IProduct) => void;
  handleDelete: (id: string) => Promise<void>;
}

export const ProductItem = ({
  product,
  openEdit,
  handleDelete,
}: IProductItem) => {
  const { id, title, category, description, price, quantity } = product;

  return (
    <li className={styles.item}>
      <article className={styles.product}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.category}>{category}</span>
          <p className={styles.description}>{description}</p>
          <div className={styles.details}>
            <span className={styles.price}>{price}</span>
            <span className={styles.quantity}>{quantity}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.buttonEdit}`}
            onClick={() => openEdit(product)}
          >
            Редактировать
          </button>
          <button
            className={`${styles.button} ${styles.buttonDelete}`}
            onClick={() => handleDelete(id.toString())}
          >
            Удалить
          </button>
        </div>
      </article>
    </li>
  );
};
