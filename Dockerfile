# Base image
FROM node:18

RUN apt-get update 
RUN apt-get install -y libsdl-pango-dev

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

COPY public ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

RUN chmod +x start.sh

# Start the server using the production build
CMD ["./start.sh"]
