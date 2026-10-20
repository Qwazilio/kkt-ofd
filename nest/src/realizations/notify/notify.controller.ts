import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { NotifyService } from './notify.service';
import { Notify } from './notify.entity';
import { CreateNotifyDto } from './dto/create-notify.dto';
import { DeleteResult } from 'typeorm';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Get('list')
  async getList(): Promise<Notify[]> {
    return await this.notifyService.getAll();
  }

  @Post('create')
  async create(@Body() createNotifyDto: CreateNotifyDto): Promise<Notify> {
    return await this.notifyService.create(createNotifyDto);
  }

  @Delete('delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return await this.notifyService.delete(Number(id));
  }

  @Patch('update/:id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.notifyService.update(id, dto.enabled);
  }
}
