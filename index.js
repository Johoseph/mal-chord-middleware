import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { router } from "./routes/router.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use("/", router);

app.listen(port, () => {
  console.log(`MAL Middleware started at http://localhost:${port}`);
});
