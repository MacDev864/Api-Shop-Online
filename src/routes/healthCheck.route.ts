import express, { Request, Response } from 'express';

import { ResponseT } from '../interfaces';
import { customResponse } from '../utils';

const router = express.Router();

router.get('/', (req: Request, res: Response<ResponseT>) => {
  const message = 'Welcome to Rest API - 👋🌎🌍🌏 - health check confirm';
  res.send(customResponse({ data: null, success: true, error: false, message, status: 200 }));
});

export default router;
