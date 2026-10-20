import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Terminal } from 'src/realizations/terminal/terminal.entity';
import {
  Between,
  DeleteResult,
  FindOptionsWhere,
  Like,
  Repository,
} from 'typeorm';
import { EmailService } from '../email/email.service';
import { CardService } from '../card/card.service';
import { Card } from '../card/card.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TerminalService {
  constructor(
    @InjectRepository(Terminal)
    private terminalRepository: Repository<Terminal>,
    private readonly cardService: CardService,
    private readonly httpService: HttpService,
  ) {}

  async getAll(): Promise<Terminal[]> {
    const terminals = await this.terminalRepository.find({
      relations: ['active_card', 'cards'],
    });
    if (!terminals) throw new NotFoundException('Terminals not found!');
    return terminals;
  }

  async getOne({ terminal_id }: { terminal_id: number }): Promise<Terminal> {
    const terminal = await this.terminalRepository.findOne({
      where: { id: terminal_id },
      relations: ['active_card'],
    });
    if (!terminal) throw new NotFoundException('Terminal not found!');
    return terminal;
  }

  async add(terminal: Partial<Terminal>): Promise<Terminal> {
    const terminal_old = await this.terminalRepository.findOne({
      where: { uid_terminal: terminal.uid_terminal },
      relations: ['active_card'],
    });
    if (terminal_old) return terminal_old;
    const terminal_new = this.terminalRepository.create(terminal);
    return await this.terminalRepository.save(terminal_new);
  }

  async update(terminal_updated: Partial<Terminal>): Promise<Terminal> {
    const terminal = await this.terminalRepository.findOneBy({
      id: terminal_updated.id,
    });
    if (!terminal) throw new NotFoundException('Terminal not found!');
    this.terminalRepository.merge(terminal, terminal_updated);
    return await this.terminalRepository.save(terminal);
  }

  async getByField(
    field: string,
    value: string,
    skipInactive: boolean = true,
  ): Promise<Terminal[]> {
    const terminals = await this.terminalRepository.find({
      relations: ['active_card'],
      where: {
        [field]: Like(`%${value}%`),
        deleted: !skipInactive,
        stock: !skipInactive,
      },
    });
    if (terminals.length < 0)
      throw new NotFoundException('Terminal not found!');
    return terminals;
  }

  async upsert(kkt_updated: Partial<Terminal>): Promise<Terminal> {
    if (!kkt_updated) return;
    if (!kkt_updated.active_card) return;

    const kkt = await this.add(kkt_updated);

    //Если ФН не был добавлен, то добавляем его
    if (!kkt.active_card) {
      kkt_updated.active_card = await this.cardService.add(
        kkt_updated.active_card,
      );
      kkt.active_card = kkt_updated.active_card;
      const kkt_merged = this.terminalRepository.merge(kkt, kkt_updated);
      return await this.terminalRepository.save(kkt_merged);
    }

    //Обвноялем данные терминала, если он уже существует
    if (
      kkt_updated.active_card &&
      kkt.active_card.uid_card == kkt_updated.active_card.uid_card
    ) {
      const kkt_merged = this.terminalRepository.merge(kkt, kkt_updated);
      return await this.terminalRepository.save(kkt_merged);
    } else if (!kkt_updated.active_card) {
      const kkt_merged = this.terminalRepository.merge(kkt, kkt_updated);
      return await this.terminalRepository.save(kkt_merged);
    }

    //Если ФН обновился, проверяем дату окончания и меняем данные
    if (
      new Date(kkt.active_card.end_date_card).getTime() <
      new Date(kkt_updated.active_card.end_date_card).getTime()
    ) {
      kkt_updated.active_card = await this.cardService.add(
        kkt_updated.active_card,
      );
      kkt.active_card = kkt_updated.active_card;
      const kkt_merged = this.terminalRepository.merge(kkt, kkt_updated);
      return await this.terminalRepository.save(kkt_merged);
    } else {
      return kkt;
    }
  }

  async remove(terminal_id: number): Promise<DeleteResult> {
    const result = await this.terminalRepository.delete({ id: terminal_id });
    if (result.affected === 0)
      throw new NotFoundException('Terminal not found');
    return result;
  }

  async importTerminals(
    company_name: string,
    company_token: string,
  ): Promise<string> {
    interface Kkt {
      kktName: string; // Название ККТ
      kktNumber: string; // Уникальный номер ККТ
      kktRegNumber?: string;
      kktModel?: string;
      kktCurrentSubscriptionDateTill: string | Date; // Дата окончания подписки
      kktLastCheckStatusDate: string | Date; // Последняя проверка состояния
      kktFN: string; // Уникальный идентификатор карты (ФН)
      kktFnDateTill: string | Date; // Дата окончания действия карты (ФН)
      retailAddress: string; // Адрес торговой точки
      deviceComment?: string; // Комментарий к устройству (опционально)
    }
    const mapTerminal = (kkt: Kkt[], orgName: string): Terminal[] => {
      return kkt.map(
        (kkt: Kkt) =>
          ({
            name_terminal: kkt.kktName,
            uid_terminal: kkt.kktNumber,
            kkt_model: kkt.kktModel,
            end_date_sub: kkt.kktCurrentSubscriptionDateTill,
            organization: orgName,
            address: kkt.retailAddress,
            reg_number: kkt.kktRegNumber,
            comment: kkt.deviceComment,
            active_card: {
              uid_card: kkt.kktFN,
              end_date_card: kkt.kktFnDateTill,
            } as Card,
          }) as Terminal,
      );
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://ofv-api-v0-1-1.evotor.ru/v1/client/kkts',
          {
            headers: {
              token: company_token,
              accept: 'application/json',
              acceptCharset: 'utf-8',
            },
          },
        ),
      );

      if (!response.data) return;
      const { kkts, branches } = response.data.kktList.orgBranches[0];
      const terminalsWithoutStore: Terminal[] = mapTerminal(
        kkts,
        response.data.kktList.orgName,
      );
      const terminalsWithStores: Terminal[] = branches.flatMap((branch) =>
        mapTerminal(branch.kkts, response.data.kktList.orgName),
      );
      const allTerminals: Terminal[] = [
        ...terminalsWithoutStore,
        ...terminalsWithStores,
      ];
      const results = await Promise.allSettled(
        allTerminals.map((terminal) => this.upsert(terminal)),
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected');
      failed.forEach((f) =>
        console.error(
          'Failed to upsert terminal:',
          (f as PromiseRejectedResult).reason,
        ),
      );

      return `From ${company_name} Imported: ${succeeded}/${allTerminals.length}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new NotFoundException(`Failed to import: ${message}`);
    }
  }
}
