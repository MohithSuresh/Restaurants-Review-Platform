import express from "express";
import cors from "cors";
import restaurants from "./api/routes/restaurants.route.js";
import reviews from "./api/routes/reviews.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/restaurants", restaurants);
app.use("/reviews", reviews);
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

export default app;
