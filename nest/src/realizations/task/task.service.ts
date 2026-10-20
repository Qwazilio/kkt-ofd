import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TerminalService } from '../terminal/terminal.service';
import { NotifyService } from '../notify/notify.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly terminalService: TerminalService,
    private readonly notifyService: NotifyService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 12 * * *')
  async handleDailyTask(): Promise<void> {
    console.log('Call daily task');
    await this.initNotify();
  }

  async initNotify(): Promise<void> {
    const notifies = await this.notifyService.getEnables();
    const DAY = 86400000;
    //фанки
    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const daysLeft = (due: Date, now = new Date()): number =>
      Math.round((startOfDay(due).getTime() - startOfDay(now).getTime()) / DAY);
    const escapeHtml = (v: unknown) =>
      String(v ?? '').replace(
        /[&<>"']/g,
        (c) =>
          ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          })[c]!,
      );
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatDate = (d: Date) =>
      `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

    for (const notify of notifies) {
      try {
        if (!notify.enabled) continue;
        const terminals = await this.terminalService.getByField(
          notify.matchField,
          notify.matchValue,
          notify.skipInactive,
        );

        const items = terminals
          .map((t) => {
            const due = new Date(t.active_card.end_date_card);
            return { t, due, left: daysLeft(due) };
          })
          .filter(({ left }) => left === notify.dayBefore);

        if (items.length === 0) continue;

        const terminalList = items
          .map(
            ({ t, due, left }) => `
        <li>
          <b>${escapeHtml(t.name_terminal)}</b><br/>
          Организация: ${escapeHtml(t.organization)}<br/>
          ККТ: ${escapeHtml(t.uid_terminal)}<br/>
          Адрес: ${escapeHtml(t.address)}<br/>
          Дата окончания ФН: ${formatDate(due)}<br/>
          Осталось дней: ${left}
        </li>`,
          )
          .join('');

        const messageBody = `
        <div>
          <h2>Оповещение о терминалах (ФН)</h2>
          <p>Следующие терминалы подходят к окончанию действия ФН:</p>
          <ul>${terminalList}</ul>
        </div>`;

        await this.emailService.sendEmail(
          [notify.email],
          'Оповещение о терминалах (ФН)',
          messageBody,
        );
      } catch (error) {
        console.log(error);
      }
    }
  }
}
