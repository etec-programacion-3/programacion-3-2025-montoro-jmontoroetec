FROM node:20-alpine

WORKDIR /app

# Copy package metadata first to cache dependencies layer
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Start the application using tsx. Push schema to database on startup.
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm run dev"]
