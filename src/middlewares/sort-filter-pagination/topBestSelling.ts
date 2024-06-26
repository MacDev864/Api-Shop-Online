import { NextFunction, Request, Response } from 'express';

export const topBestSelling = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.query.limit = '10';
    req.query.sort = '-ratings,price';
    req.query.limit = '10';
    req.query.fields = '-_v';
    next();
  };
};
