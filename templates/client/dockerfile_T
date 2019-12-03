FROM node
WORKDIR /app/
COPY ./tsconfig.json ./
COPY ./webpack.config.js ./
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci --ignore-scripts
COPY ./src ./src
RUN npx webpack --mode production

FROM nginx
COPY --from=0 /app/dist/ /usr/share/nginx/html
