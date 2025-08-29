# Multi-stage Dockerfile for React (Vite) + Express.js with PM2

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy package.json and package-lock.json for frontend
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Setup production environment with both apps
FROM node:18-alpine AS production

# Install PM2 globally
RUN npm install -g pm2

# Create directories for both apps
RUN mkdir -p /app/frontend /app/backend

# Setup Backend
WORKDIR /app/backend

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY server/ ./

# Setup Frontend
WORKDIR /app/frontend

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist ./

# Install serve for serving static files
RUN npm init -y && npm install serve

# Copy PM2 ecosystem file
COPY ecosystem.config.js /app/

# Expose both ports
EXPOSE 5000 8080

# Set working directory to app root
WORKDIR /app

# Start both services with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]