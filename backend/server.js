
import { config } from "dotenv";
config();
import app from "./app.js";
import connectToDB from "./config/dbConnection.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";


const PORT = process.env.PORT || 5011;

cloudinary.v2.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_secret: process.env.CLOUDNARY_API_SECRET,
    api_key: process.env.CLOUDNARY_API_KEY,
})

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

app.listen(PORT , async () => {
    await connectToDB();
    console.log(`App is running at http://localhost:${PORT}`);
    
})