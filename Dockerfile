FROM node:22 AS buildtime

# Install envsubst
RUN apt update && apt-get install -y gettext-base

ARG BUILD_NUMBER
ARG GIT_COMMIT
ARG BUILD_TIME

WORKDIR /usr/src/app

COPY . .

RUN envsubst < /usr/src/app/src/assets/buildtime-env-vars.js.template > /usr/src/app/src/assets/buildtime-env-vars.js

RUN npm install
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm install -g @angular/cli

RUN ng build
# RUN npm run prerender

FROM nginx:stable-alpine AS runtime

# Update all OS packages and install envsubst for runtime environment variable substitution
RUN apk update && apk upgrade --no-cache && apk add --no-cache gettext

RUN rm -rf /usr/share/nginx/html/*

COPY --from=buildtime /usr/src/app/dist/cover-printer-app/browser /usr/share/nginx/html
COPY --from=buildtime /usr/src/app/src/assets/runtime-env-vars.js.template /usr/share/nginx/html/assets/runtime-env-vars.js.template
COPY nginx_conf/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/runtime-env-vars.js.template > /usr/share/nginx/html/assets/runtime-env-vars.js && exec nginx -g 'daemon off;'"]
