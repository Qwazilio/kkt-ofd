import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { Terminal } from 'src/realizations/terminal/terminal.entity';

@Controller('terminal')
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Get('list')
  async getTerminals(): Promise<Terminal[]> {
    return await this.terminalService.getAll();
  }

  @Post('add')
  async addTerminal(@Body() terminal: Partial<Terminal>): Promise<Terminal> {
    return await this.terminalService.add(terminal);
  }

  @Get()
  async getTerminal(@Query('id') kkt_id: number): Promise<Terminal> {
    return await this.terminalService.getOne({ terminal_id: kkt_id });
  }

  @Get('test')
  async getTest(): Promise<boolean> {
    return true;
  }
}
