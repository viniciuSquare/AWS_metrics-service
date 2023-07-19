FROM node:18-alpine3.17

WORKDIR /usr/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# RUN apk update \
#   && apk add openssl1.1-compat

RUN apk add --update --no-cache openssl1.1-compat

COPY package*.json ./

RUN npm ci && npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]