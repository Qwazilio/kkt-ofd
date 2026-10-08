// admin-seed.service.ts
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const adminName = process.env.ADMIN_NAME ?? 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD ?? '0000';

    const exists = await this.userRepo.findOne({ where: { name: adminName } });
    if (exists) return;

    const hash = await bcrypt.hash(adminPassword, 10);
    await this.userRepo.save(
      this.userRepo.create({ name: adminName, password: hash }),
    );

    this.logger.warn(
      `Создан админ "${adminName}" с дефолтным паролем — смените его!`,
    );
  }
}
