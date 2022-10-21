// =================== packages ====================
import { NextFunction, Request, Response } from 'express';
// ======================================================
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import { generalResponse } from '@/helper/common.helper';

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  try {
    if (error instanceof HttpException) {
      const status: number = error.status || 500;
      const message: string = error.message || 'Something went wrong!';
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
      return generalResponse(res, null, message, 'error', true, status);
    }
    return generalResponse(res, error.stack, 'Server Error!', 'error', true, 500);
  } catch (err) {
    next(err);
  }
  return true;
};

export default errorMiddleware;
