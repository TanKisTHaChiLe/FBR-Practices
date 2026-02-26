import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Products API',
      version: '1.0.0',
      description: 'API для управления товарами в интернет-магазине',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Локальный сервер',
      },
    ],
    Error: {
        type: 'object',
        properties: {
        error: {
            type: 'string',
            description: 'Сообщение об ошибке',
        },
        },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;