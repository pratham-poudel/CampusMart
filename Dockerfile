FROM node
WORKDIR /app
COPY package.json package-lock.json 
COPY package-lock.json package-lock.json
COPY . .
RUN npm install


ENTRYPOINT [ "node","app.js" ]