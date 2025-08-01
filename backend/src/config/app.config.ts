import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  swaggerTitle: process.env.SWAGGER_TITLE || 'Products API',
  swaggerDescription:
    process.env.SWAGGER_DESCRIPTION || 'API for product management',
  swaggerVersion: process.env.SWAGGER_VERSION || '1.0',
}));
