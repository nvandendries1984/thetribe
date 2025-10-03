# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]