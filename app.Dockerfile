FROM node:18.16

RUN apt update && apt install -y apt-transport-https ca-certificates sqlite3

WORKDIR /opt/bionet
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 8081
CMD ["node", "./dist/app.js"]

