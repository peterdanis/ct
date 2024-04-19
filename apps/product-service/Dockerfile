FROM node:20.12.2-alpine3.19

RUN apk add dumb-init

WORKDIR /app
COPY ../../dist/apps/product-service/package.json /app
RUN npm i
COPY ../../dist/apps/product-service/ /app

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "main"]