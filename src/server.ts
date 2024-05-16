import app from './app';
import { connectDB, environmentConfig } from "./configs/index";
import logger from '../src/logger';

const env = process.env.NODE_ENV;

export const startServer = async () => {
  try {
    const conn: any = await connectDB(
      environmentConfig.MONGODB_CONNECTION_STRING
    );
    console.log(`MongoDB database connection  successfully to... ${conn?.connection?.host}`);
    app?.listen(environmentConfig.PORT, () => {
      console.log(`Server is running on http://localhost:${environmentConfig.PORT}`);
    });
  } catch (error) {
    console.log('MongoDB connection error. Please make sure MongoDB is running: ');

    logger.error({
      message: `MongoDB connection error. Please make sure MongoDB is running: ${error}`,
    });
  }
}

startServer()
export default app;
