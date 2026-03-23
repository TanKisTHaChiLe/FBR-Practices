import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Alert } from "../components/Alert";
import { UserRole } from "../types";
import toast from "react-hot-toast";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "user" as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.register(formData);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      toast.success("Регистрация успешна!");
      navigate("/products");
    } catch (error: any) {
      setError(error.response?.data?.error || "Ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 card p-10">
        <div className="text-center">
          <h2 className="title text-4xl mb-2">Регистрация</h2>
          <p className="text-dark-400">Создайте новый аккаунт</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input"
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Имя
              </label>
              <input
                id="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="input"
                placeholder="Иван"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Фамилия
              </label>
              <input
                id="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="input"
                placeholder="Иванов"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="input"
              placeholder="Минимум 6 символов"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Роль
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="input"
              disabled={isLoading}
            >
              <option value="user">Пользователь</option>
              <option value="seller">Продавец</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <p className="text-xs text-dark-400 text-center mt-2">
            ⚡ Выбор роли доступен только для демонстрации. В реальном проекте роль назначается администратором.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-6"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : "Зарегистрироваться"}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center">
          <Link
            to="/login"
            className="text-accent-400 hover:text-accent-300 transition-colors"
          >
            Уже есть аккаунт? Войти
          </Link>
        </p>
      </div>
    </div>
  );
};