import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from 'src/realizations/card/card.entity';
import { Terminal } from 'src/realizations/terminal/terminal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async getAll(): Promise<Card[]> {
    const cards = await this.cardRepository.find({
      relations: ['terminal'],
    });
    if (!cards) throw new NotFoundException('Cards not found!');
    return cards;
  }

  async add(card: Card): Promise<Card> {
    const card_old = await this.cardRepository.findOne({
      where: { uid_card: card.uid_card },
    });
    if (card_old) {
      return card_old;
    }
    const card_new = this.cardRepository.create({
      uid_card: card.uid_card,
      end_date_card: card.end_date_card,
    });

    return await this.cardRepository.save(card_new);
  }

}
