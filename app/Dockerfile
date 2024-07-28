# Use a Node.js 20 image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/app @shopify/cli

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# You'll probably want to remove this in production, it's here to make it easier to test things!
RUN rm -f prisma/dev.sqlite

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "docker-start"]
