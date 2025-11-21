# Build stage
FROM node:18 AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all files
COPY . .

# Disable CI warnings
ENV CI=false

# Build with placeholder values
ENV REACT_APP_API_URL=__REACT_APP_API_URL__
ENV REACT_APP_IMAGE_PATH=__REACT_APP_IMAGE_PATH__
ENV REACT_APP_MAINTENANCE_MODE=__REACT_APP_MAINTENANCE_MODE__

# Build the app
RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Inject env vars at runtime then start nginx
CMD ["/bin/sh", "-c", "/docker-entrypoint.sh && nginx -g 'daemon off;'"]
