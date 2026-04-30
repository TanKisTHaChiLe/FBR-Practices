import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/roles.middleware";
import { users, findUserById } from "../data/db";
import { UserResponseDTO, UpdateUserDTO } from "../types/user.types";
import { hashPassword } from "../utils/password.utils";
import { cacheMiddleware } from "../middleware/cache-middleware";
import { checkResponse } from "../redis/redis-utils";

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получение списка пользователей (только для админа)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       403:
 *         description: Доступ запрещен
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  cacheMiddleware(300),
  async (req, res) => {
    const usersResponse: UserResponseDTO[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      createdAt: user.createdAt,
    }));

    await checkResponse(res, usersResponse)

    res.json(usersResponse);
  },
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получение пользователя по ID (только для админа)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь найден
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Пользователь не найден
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  cacheMiddleware(300),
  async (req, res) => {
    const { id } = req.params;
    const user = findUserById(id);

    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    const userResponse: UserResponseDTO = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      createdAt: user.createdAt,
    };

    await checkResponse(res, userResponse);

    res.json(userResponse);
  },
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновление информации пользователя (только для админа)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Пользователь не найден
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    const updates: UpdateUserDTO = req.body;

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    if (
      users[userIndex].role === "admin" &&
      updates.role &&
      updates.role !== "admin"
    ) {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        res
          .status(400)
          .json({ error: "Нельзя удалить последнего администратора" });
        return;
      }
    }

    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const userResponse: UserResponseDTO = {
      id: users[userIndex].id,
      email: users[userIndex].email,
      first_name: users[userIndex].first_name,
      last_name: users[userIndex].last_name,
      role: users[userIndex].role,
      createdAt: users[userIndex].createdAt,
    };

    res.json(userResponse);
  },
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Блокировка пользователя (только для админа)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Пользователь не найден
 */
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }

  if (users[userIndex].id === req.user?.sub) {
    res.status(400).json({ error: "Нельзя заблокировать самого себя" });
    return;
  }

  if (users[userIndex].role === "admin") {
    const adminCount = users.filter((u) => u.role === "admin").length;
    if (adminCount <= 1) {
      res
        .status(400)
        .json({ error: "Нельзя удалить последнего администратора" });
      return;
    }
  }

  users.splice(userIndex, 1);
  res.json({ message: "Пользователь успешно заблокирован" });
});

export default router;
