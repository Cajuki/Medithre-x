# Use an official Node.js runtime as a parent image
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /usr/src/app

# Copy backend package files first, install dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend application source
COPY backend/ ./

# Expose port expected by Cloud Run
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
