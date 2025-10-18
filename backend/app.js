import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import userRoutes from "./routes/user.routers.js";
import courseRoutes from "./routes/coures.routes.js";
import paymentRoutes from "./routes/payment.routes.js"
import errorMiddleware from "./middleware/error.middleware.js";
// import miscRoutes from "./routes/miscellaneous.routes.js";
import morgan from "morgan";

const app = express();

// app.use(cors());

app.use(cors({
    origin: true,
    credentials: true
}));


// Preflight handling (optional but safe)
// app.options("*", cors({
//     origin: process.env.FRONTED_URL,
//     credentials: true
// }));

app.use(express.json())

app.use(morgan(`dev`))    //read morgan documemtaion for knowladge

app.use(cookieParser());

app.use(`/ping`, (req, res) => {
    res.send(`Pong`);
})

app.use(`/api/v1/user`, userRoutes);
app.use(`/api/v1/courses`, courseRoutes);
app.use(`/api/v1/payments`, paymentRoutes);
// app.use('/api/v1', miscRoutes);

app.use(`*`, (req, res) => {
    res.status(404).send(`OOPS!! 4040 page not found`)
})

app.use(errorMiddleware);

export default app;