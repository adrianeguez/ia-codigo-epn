# 🚀 Sistema de Gestión de Productos - Backend API

Backend API desarrollado con NestJS v10, TypeScript y SQLite para el Sistema de Gestión de Productos.

## 📋 Características

- **Framework**: NestJS v10 con TypeScript
- **Base de Datos**: SQLite con TypeORM
- **Autenticación**: JWT con Passport
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger/OpenAPI
- **Rate Limiting**: Throttler
- **Testing**: Jest + Supertest

## 🛠️ Tecnologías

- **Node.js**: 22.x (LTS)
- **NestJS**: 10.x
- **TypeScript**: 5.x
- **SQLite**: 5.x
- **TypeORM**: 0.3.x
- **JWT**: Autenticación
- **Swagger**: Documentación API

## 📁 Estructura del Proyecto

```
src/
├── config/                 # Configuraciones
│   ├── database.config.ts  # Configuración de BD
│   └── app.config.ts       # Configuración general
├── database/               # Base de datos
│   └── entities/           # Entidades TypeORM
│       ├── user.entity.ts
│       ├── product.entity.ts
│       └── category.entity.ts
├── modules/                # Módulos de la aplicación
│   ├── auth/              # Autenticación
│   ├── products/          # Gestión de productos
│   ├── categories/        # Gestión de categorías
│   └── reports/           # Reportes y analytics
└── main.ts                # Punto de entrada
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 22.x o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Ejecutar la aplicación**
   ```bash
   # Desarrollo
   npm run start:dev
   
   # Producción
   npm run build
   npm run start:prod
   ```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil

### Productos
- `GET /api/products` - Listar productos (con filtros y paginación)
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener producto
- `PATCH /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/products/stats` - Estadísticas de productos
- `GET /api/products/low-stock` - Productos con stock bajo
- `GET /api/products/out-of-stock` - Productos agotados
- `GET /api/products/featured` - Productos destacados
- `GET /api/products/search` - Buscar productos

### Categorías
- `GET /api/categories` - Listar categorías (estructura de árbol)
- `POST /api/categories` - Crear categoría
- `GET /api/categories/:id` - Obtener categoría
- `PATCH /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría
- `GET /api/categories/roots` - Categorías raíz
- `GET /api/categories/:id/children` - Subcategorías
- `GET /api/categories/:id/parents` - Categorías padre
- `PATCH /api/categories/:id/move/:newParentId` - Mover categoría

### Reportes
- `GET /api/reports/products/stats` - Estadísticas de productos
- `GET /api/reports/categories/stats` - Estadísticas por categoría
- `GET /api/reports/products/top` - Productos más vistos
- `GET /api/reports/inventory/low-stock` - Reporte stock bajo
- `GET /api/reports/inventory/out-of-stock` - Reporte agotados
- `GET /api/reports/products/growth` - Crecimiento de productos
- `GET /api/reports/inventory/value` - Valor del inventario
- `GET /api/reports/users/activity` - Actividad de usuarios
- `GET /api/reports/system/health` - Salud del sistema

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación.

### Roles de Usuario
- **ADMIN**: Acceso completo al sistema
- **MANAGER**: Gestión de productos y reportes
- **USER**: Acceso básico a productos

### Uso de Tokens
```bash
# Incluir en headers de las peticiones
Authorization: Bearer <your-jwt-token>
```

## 📊 Base de Datos

### Entidades Principales

#### User
- Información de usuario
- Roles y permisos
- Autenticación

#### Product
- Información completa del producto
- Stock y precios
- Categorización
- Imágenes y multimedia

#### Category
- Estructura jerárquica
- Relaciones padre-hijo
- Organización de productos

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Servidor de desarrollo con hot reload
npm run start:debug        # Servidor con debugging

# Producción
npm run build              # Compilar para producción
npm run start:prod         # Ejecutar en producción

# Calidad de código
npm run lint               # Linting con ESLint
npm run format             # Formateo con Prettier

# Base de datos
npm run migration:generate # Generar migración
npm run migration:run      # Ejecutar migraciones
npm run migration:revert   # Revertir migración
npm run db:seed            # Poblar base de datos
```

## 📚 Documentación API

La documentación interactiva está disponible en:
- **Swagger UI**: http://localhost:3000/api
- **OpenAPI JSON**: http://localhost:3000/api-json

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos
DATABASE_TYPE=sqlite
DATABASE_DATABASE=products.db

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1d

# Aplicación
PORT=3000
NODE_ENV=development
API_PREFIX=api

# Swagger
SWAGGER_TITLE=Products API
SWAGGER_DESCRIPTION=API for product management
SWAGGER_VERSION=1.0
```

## 🚀 Deployment

### Docker (Recomendado)

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Manual

```bash
# 1. Build del proyecto
npm run build

# 2. Instalar dependencias de producción
npm ci --only=production

# 3. Configurar variables de entorno
# 4. Ejecutar migraciones
npm run migration:run

# 5. Iniciar aplicación
npm run start:prod
```

## 📊 Monitoreo

### Health Check
- Endpoint: `GET /api/health`
- Verifica estado de la base de datos
- Información del sistema

### Logs
- Logs estructurados en desarrollo
- Configuración de niveles de log
- Rotación automática en producción

## 🔒 Seguridad

- **Rate Limiting**: 100 requests por minuto
- **CORS**: Configurado para desarrollo
- **Validación**: Todos los inputs validados
- **Sanitización**: Prevención de XSS
- **JWT**: Tokens seguros con expiración

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Documentación**: [Swagger UI](http://localhost:3000/api)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@example.com

---

**Desarrollado con ❤️ por el Equipo de Desarrollo**
