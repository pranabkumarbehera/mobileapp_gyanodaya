# Step 1: Establish base image with dependencies cached
FROM node:22-alpine AS base
WORKDIR /app

# Install OpenJDK 17 and configure environment variables
RUN apk add --no-cache openjdk17-jdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH="$JAVA_HOME/bin:$PATH"

# Copy package configurations
COPY package*.json ./

# Install dependencies using the correct peer-dependency fallback
RUN npm install --legacy-peer-deps

# Step 2: Target for local containerized development
FROM base AS development
# Copy project files (can be overridden by volume mounts)
COPY . .

# Expose webpack dev port
EXPOSE 3000

# Start webpack serve binding to all network interfaces inside container
CMD ["npm", "run", "web", "--", "--host", "0.0.0.0"]

# Step 3: Build the application assets for production deployment
FROM base AS builder
COPY . .
RUN npm run build-web

# Step 4: Run the lightweight web server with built static assets
FROM nginx:alpine AS production

# Copy web files from the build step to Nginx HTML root directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
