// src/server.ts
import express from "express";
import bodyParser from "body-parser";
import allocationRouter from "./routes/allocation";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// 👇 Eğer route içinde "/api/allocate" varsa:
app.use(allocationRouter);

// Alternatif: Eğer route sadece "/allocate" ise şu şekilde prefix'le
// app.use("/api", allocationRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
