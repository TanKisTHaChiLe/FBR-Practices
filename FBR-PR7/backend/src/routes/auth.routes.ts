import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "../utils/password.utils";
import { users, findUserByEmail, findUserById } from "../data/db";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  LoginDTO,
  UserResponseDTO,
  TokenPayload,
  UserRole,
} from "../types/user.types";

const router = Router();

const refreshTokens: Set<string> = new Set();

const generateAccessToken = (user: any): string => {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.ACCESS_EXPIRES_IN || "15m",
  });
};

const generateRefreshToken = (user: any): string => {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.REFRESH_EXPIRES_IN || "7d",
  });
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя (доступно гостям)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Неверные данные
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
      res.status(400).json({
        error: "Все поля обязательны: email, first_name, last_name, password",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Неверный формат email" });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ error: "Пароль должен содержать минимум 6 символов" });
      return;
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
      return;
    }

    const passwordHash = await hashPassword(password);

    const userRole: UserRole =
      role && ["user", "seller", "admin"].includes(role) ? role : "user";

    const newUser = {
      id: nanoid(),
      email,
      first_name,
      last_name,
      passwordHash,
      role: userRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    refreshTokens.add(refreshToken);

    const userResponse: UserResponseDTO = {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему (доступно гостям)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные учетные данные
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDTO = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email и пароль обязательны" });
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    const userResponse: UserResponseDTO = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.json({
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов (доступно гостям)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Токены успешно обновлены
 *       401:
 *         description: Невалидный токен
 */
router.post("/refresh", (req: Request, res: Response): void => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "refreshToken is required" });
    return;
  }

  if (!refreshTokens.has(refreshToken)) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as TokenPayload;

    const user = findUserById(payload.sub);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    refreshTokens.delete(refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.add(newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    refreshTokens.delete(refreshToken);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получение информации о текущем пользователе (доступно пользователям, продавцам, админам)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *       401:
 *         description: Не авторизован
 */
router.get("/me", authMiddleware, (req: Request, res: Response): void => {
  const userId = req.user?.sub;

  if (!userId) {
    res.status(401).json({ error: "Не авторизован" });
    return;
  }

  const user = findUserById(userId);

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

  res.json(userResponse);
});

export default router;
