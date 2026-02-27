# gunakan node official
FROM node:20-alpine

# set working directory
WORKDIR /app

# copy package.json dulu (cache optimization)
COPY package*.json ./

# install dependencies
RUN npm install

# copy semua source
COPY . .

# expose port
EXPOSE 3000

# command run app
CMD ["node", "index.js"]