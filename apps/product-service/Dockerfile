FROM node:20.12.2-alpine3.19

RUN apk add dumb-init

WORKDIR /app
COPY ../../dist/apps/product-service/package.json /app
# npm ci does not currently work with generated package-lock file
RUN npm i
COPY ../../dist/apps/product-service/ /app

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "main"]