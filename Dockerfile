# Start with the official Node.js base image.
FROM node:14

# Set the working directory in the Docker image.
WORKDIR /app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# The application's port.
EXPOSE 3001

# The command to run your application.
CMD [ "node", "server.js" ]
