import "reflect-metadata";
import express from "express";
import { ENV } from "./config";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("¡Server running!");
});

const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`Server on port: ${PORT}`);
});
