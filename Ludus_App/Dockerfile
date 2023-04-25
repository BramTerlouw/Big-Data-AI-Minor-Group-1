# Specify the base image to use
FROM node:18.10.0

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port for the server
EXPOSE 4200

CMD npm start