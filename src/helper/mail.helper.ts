// =================== import packages ====================
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import ejs from 'ejs';
// ======================================================
import { MAIL_FROM, MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } from '@/config';

const transporter = nodemailer.createTransport({
  pool: true,
  host: MAIL_HOST,
  port: Number(MAIL_PORT),
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

export const sendMail = async (
  to: string[],
  subject: string,
  templateName: string,
  replacement?: object,
  attachments?: any,
  cc?: string[],
  bcc?: string[],
) => {
  try {
    const newReplacement = { ...replacement };
    let filePath = '';
    if (templateName) {
      filePath = path.join(__dirname, `../templates/${templateName}.ejs`);
    } else {
      filePath = path.join(__dirname, '../templates/index.ejs');
    }
    const result = await ejs
      .renderFile(
        filePath,
        newReplacement
      );
    const mailOptions = {
      from: MAIL_FROM,
      to,
      subject,
      cc,
      bcc,
      html: result,
      attachments,
    };
    let response;
    return transporter.sendMail(mailOptions, (error: Error) => {
      if (error) {
        response = false;
        return response;
      }
      response = true;
      return response;
    });
  } catch (error) {
    throw new Error(error);
  }
};
