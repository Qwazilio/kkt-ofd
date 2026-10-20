import { Module } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { TerminalModule } from '../terminal/terminal.module';
import { NotifyService } from './notify.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notify } from './notify.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notify]), TerminalModule],
  controllers: [NotifyController],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
