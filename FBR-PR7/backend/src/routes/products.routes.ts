import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/roles.middleware';
import { products, findProductById } from '../data/db';
import { CreateProductDTO, UpdateProductDTO, ProductResponseDTO } from '../types/product.types';

const router = Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создание нового товара (только для продавца и админа)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *       403:
 *         description: Недостаточно прав
 */
router.post('/', 
  authMiddleware, 
  roleMiddleware(['seller', 'admin']), 
  (req: Request, res: Response): void => {
    try {
      const { title, category, description, price }: CreateProductDTO = req.body;
      const userId = req.user?.sub;

      if (!userId) {
        res.status(401).json({ error: 'Не авторизован' });
        return;
      }

      if (!title || !category || !description || price === undefined) {
        res.status(400).json({ 
          error: 'Все поля обязательны: title, category, description, price' 
        });
        return;
      }

      if (typeof price !== 'number' || price <= 0) {
        res.status(400).json({ error: 'Цена должна быть положительным числом' });
        return;
      }

      const newProduct = {
        id: nanoid(),
        title,
        category,
        description,
        price,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      products.push(newProduct);

      const productResponse: ProductResponseDTO = {
        ...newProduct
      };

      res.status(201).json(productResponse);
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получение списка всех товаров (доступно всем авторизованным пользователям)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *       401:
 *         description: Не авторизован
 */
router.get('/', 
  authMiddleware, 
  roleMiddleware(['user', 'seller', 'admin']), 
  (req: Request, res: Response): void => {
    const productsResponse: ProductResponseDTO[] = products.map(product => ({
      ...product
    }));

    res.json(productsResponse);
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получение товара по ID (доступно всем авторизованным пользователям)
 *     tags: [Products]
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
 *         description: Товар найден
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
router.get('/:id', 
  authMiddleware, 
  roleMiddleware(['user', 'seller', 'admin']), 
  (req: Request, res: Response): void => {
    const { id } = req.params;

    const product = findProductById(id);

    if (!product) {
      res.status(404).json({ error: 'Товар не найден' });
      return;
    }

    const productResponse: ProductResponseDTO = {
      ...product
    };

    res.json(productResponse);
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновление товара (только для продавца и админа)
 *     tags: [Products]
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
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */
router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['seller', 'admin']), 
  (req: Request, res: Response): void => {
    const { id } = req.params;
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    const updates: UpdateProductDTO = req.body;

    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      res.status(404).json({ error: 'Товар не найден' });
      return;
    }

    if (userRole !== 'admin' && products[productIndex].userId !== userId) {
      res.status(403).json({ error: 'Нет доступа к этому товару' });
      return;
    }

    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price <= 0)) {
      res.status(400).json({ error: 'Цена должна быть положительным числом' });
      return;
    }

    products[productIndex] = {
      ...products[productIndex],
      ...updates,
      updatedAt: new Date()
    };

    const productResponse: ProductResponseDTO = {
      ...products[productIndex]
    };

    res.json(productResponse);
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаление товара (только для админа)
 *     tags: [Products]
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
 *         description: Товар удален
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */
router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  (req: Request, res: Response): void => {
    const { id } = req.params;

    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      res.status(404).json({ error: 'Товар не найден' });
      return;
    }

    products.splice(productIndex, 1);
    res.json({ message: 'Товар успешно удален' });
  }
);

export default router;