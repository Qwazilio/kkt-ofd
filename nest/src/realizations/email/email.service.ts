import { Injectable, OnModuleInit } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService implements OnModuleInit {
  constructor(private readonly mailerService: MailerService) {}

  async onModuleInit() {
    try {
      // transporter приватный в типах, поэтому приводим тип
      const transporter = (this.mailerService as any).transporter;
      await transporter.verify();
      console.log('SMTP: соединение и авторизация успешны');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`SMTP: ошибка настроек: ${message}`);
    }
  }

  async sendEmail(
    recipients: string[],
    subject: string = 'Оповещение от помощника',
    html?: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: [...recipients],
        from: 'no-reply <assistant@masterminutka.ru>',
        subject: subject,
        text: 'Автоматически сгенерированное сообщение',
        html: html,
      });
      return { success: true, message: 'Письмо отправлено' };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error?.message };
      } else {
        return { success: false, error: 'Неизвестная ошибка' };
      }
    }
  }
}
