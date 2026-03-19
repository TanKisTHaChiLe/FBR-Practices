import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth & Products API',
      version: '1.0.0',
      description: 'API для аутентификации и управления товарами',
      contact: {
        name: 'Загородних Николай Анатольевич, Краснослободцева Дарья Борисовна'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Локальный сервер'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    message: 'Auth & Products API',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        me: 'GET /api/auth/me'
      },
      products: {
        create: 'POST /api/products',
        getAll: 'GET /api/products',
        getOne: 'GET /api/products/:id',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      }
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Swagger UI доступен по адресу http://localhost:${PORT}/api-docs`);
});