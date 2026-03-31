# Stage 1: Build the Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package metadata
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app to "dist" directory
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy built artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
