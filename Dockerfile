FROM node:18-bullseye as build

ARG REACT_APP_RECAPTCHA_DISABLED

WORKDIR /usr/app

COPY package*.json .

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM httpd:alpine

COPY --from=build /usr/app/build/ $HTTPD_PREFIX/htdocs/
COPY ./conf/apache-forpdi.conf $HTTPD_PREFIX/conf/extra/forpdi.conf
COPY ./conf/apache-httpd.conf $HTTPD_PREFIX/conf/httpd.conf

EXPOSE 80
