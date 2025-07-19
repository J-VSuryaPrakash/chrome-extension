import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./env"
})

app.on("error", (error) => {
    console.log("Express server error", error);
    process.exit(1);
})

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port http://localhost:${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MONGODB CONNECTION FAILED",error);
    process.exit(1);
})