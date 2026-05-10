# Use an official Node.js runtime as a parent image
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /usr/src/app

# Copy backend package files first, install dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend application source
COPY backend/ ./

# Ensure uploads directory exists for local development (ignored in prod)
RUN mkdir -p /usr/src/app/uploads/products /usr/src/app/uploads/categories

# Expose port expected by Cloud Run
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
