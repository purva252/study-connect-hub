import { Request, Response, NextFunction } from 'express';

export interface IError extends Error {
  statusCode?: number;
}

export const errorHandler = (err: IError, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
