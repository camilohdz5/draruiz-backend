# 🎯 Dr. Ruiz Backend API

Backend API for the emotional dependency voice assistant, featuring the cloned voice of a licensed psychologist.

## 🏗 Architecture

- **Framework:** Express.js with TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (with pgvector extension)
- **Deployment:** Railway
- **Authentication:** JWT

## 🚀 Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/subscription_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Security
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### 3. Set up the database

```bash
# Create the PostgreSQL database
createdb subscription_db

# Install the pgvector extension (required for vector search)
psql -d subscription_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run Prisma migrations
npx prisma migrate deploy
```

> **Note:** If you get a permissions error when creating the extension, check your PostgreSQL provider's documentation or install the extension manually as a superuser.

### 4. Run in development

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

## 🚂 Deploy on Railway

### 1. Create a project on Railway

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository

### 2. Set up PostgreSQL

1. In your Railway project, go to "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically configure `DATABASE_URL`

### 3. Configure environment variables

In Railway, go to the "Variables" tab and set:

```env
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
```

### 4. Deploy

Railway will automatically detect your project and deploy your application.

## 📊 Endpoints

### Health Check
- `GET /health` - Server status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Conversations (future)
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id` - Get conversation
- `POST /api/conversations/:id/messages` - Send message

## 🗄 Database

### Main models:

- **User:** System users
- **UserProfile:** Mental health profiles
- **Conversation:** Assistant conversations
- **Message:** Individual messages
- **UserSubscription:** User subscriptions
- **SubscriptionPlan:** Available plans

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Deploy migrations (production)
npx prisma migrate deploy

# Reset the database and apply all migrations (DANGEROUS: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

## 🔧 Available Scripts

- `npm start` - Start in production
- `npm run dev` - Start in development with hot reload
- `npm run build` - Compile TypeScript
- `npx prisma ...` - Prisma CLI commands

## 🛡 Security

- **Helmet.js** for security headers
- **CORS** configured
- **JWT** for authentication
- **Rate limiting** (pending)
- **Input validation** with Zod
- **SSL** in production

## 📝 Next Steps

1. ✅ Backend base setup
2. ✅ Railway + PostgreSQL configuration
3. 🔄 Implement full authentication
4. 🔄 Conversation endpoints
5. 🔄 ElevenLabs integration
6. 🔄 Claude/OpenAI integration
7. 🔄 Crisis detection system
8. 🔄 Push notifications

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🧪 Example: Using pgvector with Prisma

### Example Prisma model

```prisma
model EmbeddingExample {
  id        Int     @id @default(autoincrement())
  embedding Vector  @db.Vector(3)
  description String?
}
```

> Note: You need the [prisma-vector-extension](https://github.com/prisma/prisma-vector-extension) and the pgvector extension enabled in your database.

### Saving an embedding with Prisma Client

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.embeddingExample.create({
  data: {
    embedding: [0.1, 0.2, 0.3],
    description: 'Example vector',
  },
})
```

### Similarity search (SQL)

```sql
SELECT *, embedding <-> '[0.1, 0.2, 0.3]'::vector AS distance
FROM "EmbeddingExample"
ORDER BY distance ASC
LIMIT 5;
```

> You can use `prisma.$queryRaw` to run custom SQL queries for similarity search. 