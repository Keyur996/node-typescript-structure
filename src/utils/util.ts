// =================== import packages ====================
import * as fs from 'fs';
import { randomBytes } from 'crypto';
// import CryptoJS from 'crypto-js';
// ======================================================
// import { SECRET_KEY } from '@/config';

export const folderHandler = (path: string): boolean => {
  if (fs.existsSync(path)) {
    return true;
  }
  fs.mkdirSync(path, { recursive: true });
  return true;
};

export const fileDelete = (path: string, filename: string): boolean => {
  try {
    if (fs.existsSync(`${path}/${filename}`)) {
      fs.unlinkSync(`${path}/${filename}`);
      return true;
    }
  } catch (err) {
    console.error(err, 'File Delete Error');
    return true;
  }
};

export function createRandomToken() {
  return randomBytes(20).toString('hex');
}

// Encrypt
// export const encrypt = (data: string) => {
//   let cipherText = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
//   cipherText = cipherText.toString().replace('+', 'xMl3Jk').replace('/', 'Por21Ld').replace('=', 'Ml32');
//   return cipherText;
// };

// Decrypt
// export const decrypt = (data: string) => {
//   data = data.toString().replace('xMl3Jk', '+').replace('Por21Ld', '/').replace('Ml32', '=');
//   const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
//   return bytes.toString(CryptoJS.enc.Utf8);
// };

// export const encodeBase64 = (data: string) => {
//   return Buffer.from(data).toString('base64');
// };

// export const decodeBase64 = (data: string) => {
//   return Buffer.from(data, 'base64').toString('ascii');
// };

export const encrypt = (data: string) => {
  return Buffer.from(data).toString('base64');
};

export const decrypt = (data: string) => {
  return Buffer.from(data, 'base64').toString('ascii');
};

export const parseData = (data: any) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};
