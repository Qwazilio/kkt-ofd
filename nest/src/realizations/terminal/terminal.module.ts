import { Module } from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { TerminalController } from './terminal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Terminal } from 'src/entities/terminal.entity';
import { CardModule } from '../card/card.module';
import { TerminalGateway } from 'src/realizations/terminal/terminal.getway';
import { EmailService } from '../email/email.service';
import { HttpModule } from '@nestjs/axios';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    CardModule,
    CompanyModule,
    TypeOrmModule.forFeature([Terminal]),
    HttpModule.register({
      timeout: 60000,
      maxRedirects: 5,
    }),
  ],
  providers: [TerminalService, TerminalGateway, EmailService],
  controllers: [TerminalController],
  exports: [TerminalService],
})
export class TerminalModule {}
