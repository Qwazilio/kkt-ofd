import { Module } from '@nestjs/common';
import { TerminalModule } from '../terminal/terminal.module';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { EmailModule } from '../email/email.module';
import { NotifyModule } from '../notify/notify.module';

@Module({
  imports: [TerminalModule, EmailModule, NotifyModule],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
