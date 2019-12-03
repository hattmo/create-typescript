FROM node
WORKDIR /app/
COPY ./tsconfig.json ./
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci --ignore-scripts
COPY ./src ./src
RUN npx tsc --project .

FROM node
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENV NODE_ENV production
WORKDIR /app/
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci --production --ignore-scripts
COPY --from=0 /app/dist/ ./dist/
ENTRYPOINT [ "/tini","--","node","./dist/bin/main.js" ]
EXPOSE 80
