import React, { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { User, UserRole } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  UserIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  CalendarIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '' as UserRole
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      setError('Ошибка при загрузке пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const updatedUser = await usersApi.update(editingUser.id, editForm);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setEditingUser(null);
      toast.success('Пользователь обновлен');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при обновлении');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Заблокировать пользователя ${user.first_name} ${user.last_name}?`)) {
      return;
    }

    try {
      await usersApi.delete(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      toast.success('Пользователь заблокирован');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при блокировке');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      admin: 'bg-purple-900/30 text-purple-300 border-purple-700',
      seller: 'bg-blue-900/30 text-blue-300 border-blue-700',
      user: 'bg-green-900/30 text-green-300 border-green-700'
    };

    const labels = {
      admin: 'Администратор',
      seller: 'Продавец',
      user: 'Пользователь'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title text-3xl">Управление пользователями</h1>
        <p className="text-dark-400 mt-2">Администрирование системы</p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-accent-400">Редактирование пользователя</h2>
              <button onClick={() => setEditingUser(null)} className="text-dark-400 hover:text-accent-300">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Имя</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Фамилия</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Роль</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                  className="input"
                >
                  <option value="user">Пользователь</option>
                  <option value="seller">Продавец</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button onClick={() => setEditingUser(null)} className="btn-secondary">
                  Отмена
                </button>
                <button onClick={handleUpdate} className="btn-primary">
                  <CheckIcon className="h-5 w-5 inline mr-2" />
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <div key={user.id} className="card p-6 hover:scale-[1.01] transition-transform">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="avatar p-4">
                  <UserIcon className="h-8 w-8 text-dark-900" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-accent-300">
                      {user.first_name} {user.last_name}
                    </h3>
                    {getRoleBadge(user.role)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-dark-400">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center text-dark-400">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>
                        Зарегистрирован: {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ru })}
                      </span>
                    </div>
                    <div className="flex items-center text-dark-400">
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      <span>ID: {user.id.slice(0, 16)}...</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 text-accent-400 hover:bg-accent-400/10 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="p-2 text-light-600 hover:bg-light-600/10 rounded-lg transition-colors"
                  title="Заблокировать"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="card p-16 text-center">
          <h3 className="text-xl font-semibold text-accent-300 mb-2">
            Пользователи не найдены
          </h3>
          <p className="text-dark-400">
            В системе пока нет зарегистрированных пользователей
          </p>
        </div>
      )}
    </div>
  );
};