import { Module, Provider } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import getConfig from '../config/config'; // Adjust path if needed

const mailProvider: Provider = {
  provide: 'MAIL_TRANSPORTER',
  useFactory: (configService: ConfigService): Transporter => {
    const { EMAIL_USER, EMAIL_PASS } = getConfig(configService);
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [MailService, mailProvider],
  exports: [MailService],
})
export class MailModule {}
