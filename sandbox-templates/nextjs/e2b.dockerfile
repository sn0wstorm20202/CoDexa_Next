# Base image
FROM node:21-slim

# Install required packages
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /home/user/app

# Copy package.json & package-lock.json first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the project (TypeScript/Next.js)
RUN npm run build

# Expose the port (if Next.js runs)
EXPOSE 3000

# Default command
CMD ["npm", "run", "start"]
