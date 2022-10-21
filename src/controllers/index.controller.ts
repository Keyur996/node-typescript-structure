// =================== import packages ==================
import { NextFunction, Request, Response } from 'express';
// ======================================================
import { HttpException } from '@/exceptions/HttpException';
import prismaObj from '@/middlewares/prisma.middleware';

class IndexController {
  public index = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  public generalTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await prismaObj.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            firstname: 'test-firstname',
            lastname: 'test-lastname',
            email: 'email2@mailinator.com',
            password: '111111111',
            phone: '11111111',
            settings: {},
          },
        });
        await tx.organization.create({
          data: {
            uuid: '23231',
            settings: {},
            owner_id: user.id,
          },
        });
        return true;
      });
      if (response) {
        res.send('OK');
      } else {
        throw new HttpException(400, 'Transaction error!');
      }
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
