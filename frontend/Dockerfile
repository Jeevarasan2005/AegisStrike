FROM node:18-alpine

WORKDIR /app

COPY package.json ./
# Not copying package-lock.json because we didn't generate one, just doing npm install
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
