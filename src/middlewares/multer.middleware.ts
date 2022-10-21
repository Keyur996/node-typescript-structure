// =================== packages ====================
import { NextFunction, Request, Response, Express } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ======================================================
import { FILE_FIELD_NAME_OBJ } from '@/constants';
import { folderHandler } from '@/utils/util';
import { generalResponse } from '@/helper/common.helper';

export const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (FILE_FIELD_NAME_OBJ?.[file.fieldname]) {
    if (
      FILE_FIELD_NAME_OBJ?.[file.fieldname].fileTypes.includes(file.mimetype) ||
      file.originalname.substring(file.originalname.lastIndexOf('.') + 1) === 'glb'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
};

const storage = multer.diskStorage({
  destination: (_, file, cb) => {
    if (FILE_FIELD_NAME_OBJ?.[file.fieldname]) {
      folderHandler(`./public${FILE_FIELD_NAME_OBJ?.[file.fieldname]?.directory}`);
      cb(null, `./public/${FILE_FIELD_NAME_OBJ?.[file.fieldname]?.directory}`);
    } else {
      folderHandler('./public/temp/');
      cb(null, './public/temp');
    }
  },
  filename: (_, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const fileUpload = (fileSize: number) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file_size = fileSize * 1024 * 1024;
    multer({
      storage,
      limits: {
        fileSize: file_size,
      },
      fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        checkFileType(file, cb);
      },
    }).any()(req, res, (err1) => {
      if (err1) {
        return generalResponse(res, null, err1?.message ?? err1, 'error', true, 400);
      }
      if (req.files && req.files.length > 0) {
        if (req.files[0].size > file_size) {
          fs.stat(req.files[0].path, (err2) => {
            if (err2) {
              return generalResponse(res, null, err2?.message, 'error', true, 400);
            }
            // Delete file
            fs.unlink(req.files[0].path, (err3) => {
              if (err3) {
                return generalResponse(res, null, err3?.message, 'error', true, 400);
              }
              return generalResponse(
                res,
                null,
                `File size too big. Maximum ${fileSize}MB file size allowed`,
                'error',
                true,
                400,
              );
            });
          });
        } else {
          next();
        }
      } else {
        next();
      }
    });
  } catch (e) {
    return generalResponse(res, null, 'Server Error!', 'error', true, 500);
  }
};
