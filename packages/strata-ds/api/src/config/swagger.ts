import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Strata DS API',
      version: '1.0.0',
      description: 'RESTful API for Strata DS White Label Design System - Access all design foundations, components, tokens, and AI prompts programmatically.',
      contact: {
        name: 'Strata DS Team',
        email: 'api@strata-ds.com',
        url: 'https://strata-ds.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.strata-ds.com/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Resource not found'
                },
                code: {
                  type: 'string',
                  example: 'NOT_FOUND'
                }
              }
            }
          }
        },
        Component: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'button'
            },
            name: {
              type: 'string',
              example: 'Buttons'
            },
            category: {
              type: 'string',
              example: 'Application UI'
            },
            status: {
              type: 'string',
              enum: ['ai-ready', 'in-progress', 'special'],
              example: 'ai-ready'
            },
            description: {
              type: 'string',
              example: 'Interactive button components with variants'
            },
            variants: {
              type: 'number',
              example: 6
            }
          }
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
