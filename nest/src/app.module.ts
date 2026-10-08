import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Terminal } from './entities/terminal.entity';
import { Card } from './entities/card.entity';
import { TerminalModule } from './realizations/terminal/terminal.module';
import { CardModule } from './realizations/card/card.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './realizations/task/task.module';
import { CompanyModule } from './realizations/company/company.module';
import { Company } from './entities/company.entity';
import { UserModule } from './realizations/user/user.module';
import { AuthModule } from './realizations/auth/auth.module';
import { User } from './entities/user.entity';

@Module({
  controllers: [AppController],
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TerminalModule,
    CardModule,
    TaskModule,
    CompanyModule,
    UserModule,
    AuthModule,
    MailerModule.forRoot({
      transport: `smtps://${process.env.SMTP_USER}:${process.env.SMTP_PASSWORD}@${process.env.SMTP_HOST}`,
    }),
    TypeOrmModule.forRoot({
      database: process.env.DB_ROOT,
      entities: [Terminal, Card, Company, User],
      synchronize: true,
      //entities: [__dirname + '/**/*.entity{.ts}'],
      type: 'sqlite',
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
