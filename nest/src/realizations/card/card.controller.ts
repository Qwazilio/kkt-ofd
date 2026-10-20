import { Controller, Get } from '@nestjs/common';
import { CardService } from './card.service';
import { Card } from 'src/realizations/card/card.entity';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('list')
  async getAll(): Promise<Card[]> {
    return await this.cardService.getAll();
  }
}
