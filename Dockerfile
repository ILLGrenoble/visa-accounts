FROM node:14-slim as build

RUN apt-get update && apt-get install curl -y

RUN curl -sf https://gobinaries.com/tj/node-prune | sh

WORKDIR /app

# Bundle app source code
COPY . .

RUN npm install

RUN npm run build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

# Check out https://hub.docker.com/_/node to select a new base image
FROM node:14-alpine

# Add timezone info (to allow for modification at runtime)
RUN apk --update add tzdata alpine-conf
RUN setup-timezone -z UTC
RUN rm -r /var/cache/apk/*

WORKDIR /app

# copy from build image
COPY --from=build /app/index.js ./index.js
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

CMD [ "node", "." ]
