import { Injectable, Inject } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private configService: ConfigService,
    @Inject('MAIL_TRANSPORTER') private transporter: Transporter,
  ) {}

  async sendUserCreationEmail(email: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Welcome!',
      text: 'Your account has been created successfully.',
    });
    console.log(`Email sent to ${email}`);
  }
}
