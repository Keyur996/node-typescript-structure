// =================== import packages ==================
import { Response } from 'express';
import moment from 'moment';
// ======================================================

export const generalResponse = (
  response: Response,
  data: any = null,
  message = '',
  responseType = 'success',
  toast = false,
  statusCode = 200,
) => {
  response.status(statusCode).send({
    data,
    message,
    toast,
    responseType,
  });
};

export const isExpired = (dateTime: string) => {
  return new Date().getTime() > new Date(dateTime).getTime();
};

export const cleanObj = (obj: { [key: string]: any }) => {
  Object.keys(obj).forEach((key: string) => {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
};

export const dateFormat = (date: string | Date) => {
  if (!date) return '';
  return !Number.isNaN(new Date(date).getDate()) ? moment(date).toISOString() : date;
};

export const getFileUrl = (file: any) => {
  const tempPath = file.path.split('/');
  tempPath.shift();
  return tempPath.join('/');
};

export const stringToJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return false;
  }
};
