import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import stripeRoutes from "./routes/stripe.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TundaDrop backend is running.",
  });
});

app.use("/stripe", stripeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TundaDrop backend running on port ${PORT}`);
});