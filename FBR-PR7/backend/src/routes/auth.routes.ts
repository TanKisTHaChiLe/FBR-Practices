import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '../utils/password.utils';
import { users, findUserByEmail, findUserById } from '../data/db';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  CreateUserDTO, 
  LoginDTO, 
  UserResponseDTO, 
  AuthResponse,
  TokenPayload 
} from '../types/user.types';

const router = Router();

const refreshTokens: Set<string> = new Set();

const generateAccessToken = (user: any): string => {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name
  };

  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user: any): string => {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
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
 *                 example: user@example.com
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Иванов
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Неверные данные или email уже существует
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, first_name, last_name, password }: CreateUserDTO = req.body;

    if (!email || !first_name || !last_name || !password) {
      res.status(400).json({ 
        error: 'Все поля обязательны: email, first_name, last_name, password' 
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Неверный формат email' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
      return;
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      return;
    }

    const passwordHash = await hashPassword(password);

    const newUser = {
      id: nanoid(),
      email,
      first_name,
      last_name,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
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
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      accessToken,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDTO = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email и пароль обязательны' });
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Неверный email или пароль' });
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
      createdAt: user.createdAt
    };

    res.json({
      accessToken,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов
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
 *                 description: Refresh токен для обновления пары токенов
 *     responses:
 *       200:
 *         description: Токены успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Отсутствует refreshToken
 *       401:
 *         description: Невалидный или истекший refresh токен
 */
router.post('/refresh', (req: Request, res: Response): void => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' });
    return;
  }

  if (!refreshTokens.has(refreshToken)) {
    res.status(401).json({ error: 'Invalid refresh token' });
    return;
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as TokenPayload;

    const user = findUserById(payload.sub);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    refreshTokens.delete(refreshToken);
    
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    refreshTokens.add(newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    refreshTokens.delete(refreshToken);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получение информации о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 */
router.get('/me', (req: Request, res: Response): void => {
  const userId = req.user?.sub;
  
  if (!userId) {
    res.status(401).json({ error: 'Не авторизован' });
    return;
  }

  const user = findUserById(userId);
  
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  const userResponse: UserResponseDTO = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    createdAt: user.createdAt
  };

  res.json(userResponse);
});

export default router;