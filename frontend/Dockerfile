FROM node:18
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci
RUN npm install @stripe/stripe-js 
RUN npm install @stripe/react-stripe-js

COPY . .
RUN npm run build
RUN npm install --global http-server

CMD ["npx", "-y", "http-server", "-p", "9000", "/app/build"]
