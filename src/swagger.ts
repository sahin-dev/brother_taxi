import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Roady API',
      version: '1.0.0',
      description: 'API documentation for Roady App',
    },
    servers: [
      {
        url: 'https://roady-5qly.onrender.com/api/v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/app/modules/**/*.yml'], // adjust path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
