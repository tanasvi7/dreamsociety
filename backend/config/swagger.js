module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DREAM SOCIETY API',
      version: '1.0.0',
      description: 'REST API for DREAM SOCIETY web/mobile app',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local server' }
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
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './models/*.js'],
}; 