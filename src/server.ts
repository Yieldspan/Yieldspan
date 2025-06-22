// src/server.ts
import express from "express";
import allocationRouter from "./routes/allocation";

const app = express();
const PORT = 8080;

app.use(express.json());

app.use(allocationRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
