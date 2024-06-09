# Base image
FROM node:18 as build

RUN apt update 
RUN apt install -y libsdl-pango-dev

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

FROM node:18-alpine

RUN apk add cairo pango libjpeg62-turbo

COPY --from=build /usr/src/app/dist /opt/app/dist
COPY --from=build /usr/src/app/node_modules /opt/app/node_modules
COPY --from=build /usr/src/app/start.sh /opt/start.sh

EXPOSE 3000

WORKDIR /opt/app

# Start the server using the production build
ENTRYPOINT ["../start.sh"]
