import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// routes

import userRoute from "./routes/user.route.js"
import reportRoute from "./routes/reports.route.js"
import blocklistRoute from "./routes/blocklist.route.js"

app.use("/api/v1/user" , userRoute);

app.use("/api/v1/reports" , reportRoute);

app.use("/api/v1/blocklist" , blocklistRoute);

export  { app }