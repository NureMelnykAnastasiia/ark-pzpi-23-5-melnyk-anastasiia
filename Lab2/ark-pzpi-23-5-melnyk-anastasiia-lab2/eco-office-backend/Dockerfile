# Етап 1: Складання (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Копіюємо файли опису залежностей
COPY package*.json ./

# Встановлюємо всі залежності (включно з devDependencies для компіляції)
RUN npm install

# Копіюємо вихідний код
COPY . .

# Генеруємо Drizzle клієнт (якщо використовується drizzle-kit generate)
# RUN npm run db:generate 

# Компілюємо TypeScript у JavaScript (папка dist)
RUN npm run build

# Етап 2: Продакшн (Production)
FROM node:20-alpine

WORKDIR /app

# Встановлюємо postgresql-client, щоб працював функціонал бекапів (pg_dump/psql)
RUN apk add --no-cache postgresql-client

# Копіюємо package.json для встановлення лише продакшн-залежностей
COPY package*.json ./

# Встановлюємо ТІЛЬКИ dependencies (без devDependencies)
RUN npm install --only=production

# Копіюємо скомпільовані файли з етапу builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
# Якщо є папка для завантажень або бекапів, створюємо її
RUN mkdir -p uploads backups

# Вказуємо порт (зазвичай 3000 або той, що в .env)
EXPOSE 3000

# Запускаємо сервер
CMD ["node", "dist/server.js"]