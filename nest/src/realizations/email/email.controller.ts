import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('mail')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async sendMail(
    @Body() res: { recipients: string; subject: string; html: string },
  ) {
    await this.emailService.sendEmail([res.recipients], res.subject, res.html);
  }
}
