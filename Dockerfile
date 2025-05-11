# Use the official Node.js image as the base image
FROM node:22.14.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json package-lock.json ./

# Install application dependencies
RUN npm install
# If you're using Yarn, you can use: RUN yarn install

# Copy the rest of the application code into the container
COPY . .

RUN npm run build
