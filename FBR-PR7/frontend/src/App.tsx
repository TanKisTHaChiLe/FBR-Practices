import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { CreateProduct } from './pages/CreateProduct';
import { EditProduct } from './pages/EditProduct';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Layout>
                <Products />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/create"
          element={
            <PrivateRoute>
              <Layout>
                <CreateProduct />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <PrivateRoute>
              <Layout>
                <ProductDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <PrivateRoute>
              <Layout>
                <EditProduct />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;