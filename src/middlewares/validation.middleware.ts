// =================== import packages ====================
import { RequestHandler } from 'express';
// ======================================================
import { generalResponse } from '@/helper/common.helper';

interface Error {
  message: string;
  path: Object;
  type: string;
  context: any;
}

const errorFilterValidator = (error: Array<Error>) => {
  const extractedErrors: Array<string> = [];
  error.map((err: Error) => extractedErrors.push(err.message));
  const errorResponse = extractedErrors.join(', ');
  return errorResponse;
};

const validationMiddleware = (type: any, value: string | 'body' | 'query' | 'params' = 'body'): RequestHandler => {
  return async (req, res, next) => {
    try {
      await type.validateAsync(req[value]);
      next();
    } catch (e) {
      const error: any = e;
      if (error.details) {
        const errorResponse = errorFilterValidator(error.details);
        return generalResponse(res, null, errorResponse, 'error', true, 400);
      }
      return generalResponse(res, null, 'Something went wrong!', 'success', true, 400);
    }
  };
};

export default validationMiddleware;
