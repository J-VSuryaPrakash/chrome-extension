import mongoose from "mongoose";
import { MONGODB_NAME } from "../constants.js";
const connectDB = async () => {
    try {
        const connectionInfo = await mongoose.connect(`${process.env.MONGODB_URL}/${MONGODB_NAME}`);
        console.log(`MongoDB connected: ${connectionInfo.connection.host}`);
        console.log(`MongoDB connected: ${connectionInfo.connection.name}`);
        
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED",error);
        process.exit(1);
    }
};

export default connectDB