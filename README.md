# 🎯 Dr. Ruiz Backend API

Backend API para el asistente de voz especializado en dependencia emocional, con la voz clonada de una psicóloga licenciada.

## 🏗 Arquitectura

- **Framework:** Express.js con TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Deployment:** Railway
- **Authentication:** JWT

## 🚀 Setup Local

### Prerrequisitos

- Node.js 18+
- PostgreSQL
- npm o yarn

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=draruiz_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Security
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### 3. Configurar base de datos

```bash
# Crear base de datos PostgreSQL
createdb draruiz_db

# Ejecutar migraciones
npm run migration:deploy
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🚂 Deploy en Railway

### 1. Crear proyecto en Railway

1. Ve a [Railway.app](https://railway.app)
2. Crea un nuevo proyecto
3. Conecta tu repositorio de GitHub

### 2. Configurar PostgreSQL

1. En tu proyecto de Railway, ve a "New Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway automáticamente configurará `DATABASE_URL`

### 3. Configurar variables de entorno

En Railway, ve a la pestaña "Variables" y configura:

```env
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
```

### 4. Deploy

Railway automáticamente detectará el `railway.json` y desplegará tu aplicación.

## 📊 Endpoints

### Health Check
- `GET /health` - Estado del servidor

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Conversaciones (futuro)
- `GET /api/conversations` - Listar conversaciones
- `POST /api/conversations` - Crear conversación
- `GET /api/conversations/:id` - Obtener conversación
- `POST /api/conversations/:id/messages` - Enviar mensaje

## 🗄 Base de Datos

### Modelos principales:

- **User:** Usuarios del sistema
- **UserProfile:** Perfiles de salud mental
- **Conversation:** Conversaciones con el asistente
- **Message:** Mensajes individuales
- **UserSubscription:** Suscripciones de usuarios
- **SubscriptionPlan:** Planes disponibles

### Migraciones

```bash
# Crear nueva migración
npm run migration:create

# Ejecutar migraciones
npm run migration:deploy

# Revertir última migración
npm run migration:revert

# Ver migraciones
npm run migration:show
```

## 🔧 Scripts disponibles

- `npm start` - Iniciar en producción
- `npm run dev` - Iniciar en desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm run migration:*` - Comandos de migración

## 🛡 Seguridad

- **Helmet.js** para headers de seguridad
- **CORS** configurado
- **JWT** para autenticación
- **Rate limiting** (pendiente)
- **Input validation** con Zod
- **SSL** en producción

## 📝 Próximos pasos

1. ✅ Setup base del backend
2. ✅ Configuración de Railway + PostgreSQL
3. 🔄 Implementar autenticación completa
4. 🔄 Endpoints de conversaciones
5. 🔄 Integración con ElevenLabs
6. 🔄 Integración con Claude/OpenAI
7. 🔄 Sistema de detección de crisis
8. 🔄 Push notifications

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles. 