# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Build the project
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Only copy necessary files
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy compiled dist from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose NestJS default port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]