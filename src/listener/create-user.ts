import { Logger } from "../helper";
import nodemailer from 'nodemailer';

type MessagePayload = Record<string, unknown>;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: 'akashiseijurou414@gmail.com',
    pass: 'xyhl ysmx dqrz taql',
  },
});

export const handleCreateUser = async (payload: MessagePayload): Promise<void> => {
    Logger.info('Processing payload:', payload);
    await transporter.sendMail({
      from: 'akashiseijurou414@gmail.com',
      to: 'uchihaitaci4@gmail.com',
      subject: 'test',
      text: `send email testing`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };