// src/mailer/mailer.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendCarRegisteredEmail(to: string, subject: string, loginUrl: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      template: 'car-registered', // templates/car-registered.hbs を使用
      context: {
        loginUrl,
      },
    });
  }
}