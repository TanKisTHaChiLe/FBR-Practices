import { api } from "../../api";
import { useState, useEffect } from "react";
import { ProductList } from "../../components/ProductList/ProductList";
import type { IProduct } from "../../components/ProductItem/ProductItem";
import { ProductModal } from "../../components/ProductModal/ProductModal";

export const ProductPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState<null | IProduct>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product: IProduct) => {
    setModalMode("edit");
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Удалить пользователя?");
    if (!ok) return;

    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitModal = async (payload: any) => {
    try {
      if (modalMode === "create") {
        const newProduct = await api.addProduct(payload);
        setProducts((prev) => [...prev, newProduct]);
      } else {
        const updatedProduct = await api.updateProduct(payload.id, payload);
        setProducts((prev) =>
          prev.map((u) => (u.id === payload.id ? updatedProduct : u)),
        );
      }
    } catch (error) {
      console.log(error);
    }
    closeModal()
  };

  return (
    <div>
      <div className="page">
        <header className="header">
          <div className="header__inner">
            <div className="brand">Users App</div>
            <div className="header__right">React</div>
          </div>{" "}
        </header>
        <main className="main">
          <div className="container">
            <div className="toolbar">
              <h1 className="title">Товары</h1>
              <button className="btn btn--primary" onClick={openCreate}>
                + Создать
              </button>
            </div>
            {loading ? (
              <div className="empty">Загрузка...</div>
            ) : (
              <ProductList
                products={products}
                openEdit={openEdit}
                handleDelete={handleDelete}
              />
            )}
          </div>
        </main>
        <footer className="footer">
          <div className="footer__inner">
            © {new Date().getFullYear()} Users App
          </div>
        </footer>
        <ProductModal
          open={modalOpen}
          title={modalMode === "edit" ? "Редактирование" : "Добавление"}
          product={editingProduct}
          onSubmit={handleSubmitModal}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};
