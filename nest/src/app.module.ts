import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Terminal } from './realizations/terminal/terminal.entity';
import { Card } from './realizations/card/card.entity';
import { TerminalModule } from './realizations/terminal/terminal.module';
import { CardModule } from './realizations/card/card.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './realizations/task/task.module';
import { CompanyModule } from './realizations/company/company.module';
import { Company } from './realizations/company/company.entity';
import { UserModule } from './realizations/user/user.module';
import { AuthModule } from './realizations/auth/auth.module';
import { User } from './realizations/user/user.entity';
import { Notify } from './realizations/notify/notify.entity';
import { NotifyModule } from './realizations/notify/notify.module';
import { EmailModule } from './realizations/email/email.module';

@Module({
  controllers: [AppController],
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TerminalModule,
    CardModule,
    EmailModule,
    TaskModule,
    NotifyModule,
    CompanyModule,
    UserModule,
    AuthModule,
    TypeOrmModule.forRoot({
      database: process.env.DB_ROOT,
      entities: [Terminal, Card, Company, User, Notify],
      synchronize: true,
      //entities: [__dirname + '/**/*.entity{.ts}'],
      type: 'sqlite',
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
