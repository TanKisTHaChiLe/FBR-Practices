import { ProductItem } from "../ProductItem/ProductItem";
import { type IProduct } from "../ProductItem/ProductItem";
import styles from "./ProductList.module.css";

interface IList {
  products: IProduct[];
  openEdit: (product: IProduct) => void;
  handleDelete: (id: string) => Promise<void>;
}

export const ProductList = ({ products, openEdit, handleDelete }: IList) => {
  if (products.length === 0) {
    return <div className={styles.empty}>Товары не найдены</div>;
  }

  return (
    <ul className={styles.list}>
      {products.map((item) => (
        <ProductItem
          key={item.id}
          product={item}
          openEdit={openEdit}
          handleDelete={handleDelete}
        />
      ))}
    </ul>
  );
};
