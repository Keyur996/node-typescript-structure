// =================== import packages ==================
import prismaObj from '@/middlewares/prisma.middleware';
import { NextFunction, Request, Response } from 'express';
// ======================================================

class PlatformController {
  public addPlatform = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, status } = req.body;
      const platform = await prismaObj.platform.create({
        data: {
          status,
          name,
        },
      });
      res.send(platform);
    } catch (error) {
      next(error);
    }
  };
}

export default PlatformController;
