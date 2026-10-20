import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notify } from './notify.entity';
import { CreateNotifyDto } from './dto/create-notify.dto';

@Injectable()
export class NotifyService {
  constructor(
    @InjectRepository(Notify)
    private notifyRepository: Repository<Notify>,
  ) {}

  async getAll() {
    return await this.notifyRepository.find();
  }

  async getEnables() {
    return await this.notifyRepository.find({
      where: {
        enabled: true,
      },
    });
  }

  async getOne(id: number) {
    return await this.notifyRepository.findOne({ where: { id } });
  }

  async create(dto: CreateNotifyDto) {
    console.log(dto);
    const notify = await this.notifyRepository.findOne({
      where: {
        email: dto.email,
        matchField: dto.matchField,
        matchValue: dto.matchValue,
        dayBefore: dto.dayBefore,
      },
    });
    console.log(notify);
    if (notify) throw new ConflictException('Notify already exists');
    return this.notifyRepository.save(this.notifyRepository.create(dto));
  }

  async update(id: number, enabled: boolean) {
    const rule = await this.notifyRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Правило не найдено');
    rule.enabled = enabled;
    return await this.notifyRepository.save(rule);
  }

  async delete(id: number) {
    if (!id) throw new BadRequestException('Notify not found with id ' + id);
    return this.notifyRepository.delete(id);
  }
}
