import express from "express";

const app = express();
app.use(express.json());

app.use((_req, _res, next) => {
  next(404);
});

app.use((err, _req, res, _next) => {

  if (err === 404) {
    res.sendStatus(404);
  } else {
    res.sendStatus(500);
    process.stderr.write(err + "\n");
  }
});

export default app;
