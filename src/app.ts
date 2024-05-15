import dotenv from "dotenv";
import express from 'express';
import morgan from "morgan";
import cors from "cors";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import api from "./api";
import colors from 'colors';

dotenv.config();


// Initialize app with express
const app: express.Application | undefined = express();

// Load App Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

// Serve all static files inside public directory.

// Routes which Should handle the requests
app.use('/api/v1', api);
// app.use(notFoundMiddleware);
// app.use(errorHandlerMiddleware);

export default app;