import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login({ name, password }: LoginDto) {
    const user = await this.userRepo.findOne({ where: { name } });
    const ok = user && (await bcrypt.compare(password, user.password));

    if (!ok) {
      throw new UnauthorizedException('Неверное имя или пароль');
    }

    const payload = { sub: user.id, name: user.name };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
