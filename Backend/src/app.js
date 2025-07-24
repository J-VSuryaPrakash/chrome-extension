import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["chrome-extension://cejfkmbljnoaohacmilegoeglmhgklih", "http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));
app.use(cookieParser());


// routes

import userRoute from "./routes/user.route.js"
import reportRoute from "./routes/reports.route.js"
import blocklistRoute from "./routes/blocklist.route.js"

app.use("/api/v1/user" , userRoute);

app.use("/api/v1/reports" , reportRoute);

app.use("/api/v1/blocklist" , blocklistRoute);

export  { app }