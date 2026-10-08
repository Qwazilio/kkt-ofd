import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Terminal } from 'src/entities/terminal.entity';
import { TerminalService } from 'src/realizations/terminal/terminal.service';
import { CompanyService } from '../company/company.service';
import { UpdateTerminalDto } from './dto/update-terminal.dto';
import { UsePipes } from '@nestjs/common';
import { WsValidationPipe } from '../../pipe/ws-validaton.pipe';

@WebSocketGateway({
  cors: true,
  transport: ['websocket'],
  namespace: 'terminal',
})
export class TerminalGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly terminalService: TerminalService,
    private readonly companyService: CompanyService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const terminals = await this.terminalService.getAll();
      client.emit('terminalList', terminals);
    } catch (error) {
      console.error(error);
    }
  }

  handleDisconnect(client: Socket) {
    //console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('initImport')
  async handleImport(@ConnectedSocket() client: Socket): Promise<boolean> {
    const companies = await this.companyService.findAll();

    if (companies.length === 0) {
      client.emit('importInfo', 'Подключения не найдены');
      return false;
    }

    for (const company of companies) {
      try {
        const info = await this.terminalService.importTerminals(
          company.nickname,
          company.token,
        );
        client.emit('importInfo', info);
      } catch (e) {
        client.emit(
          'importInfo',
          `Ошибка импорта ${company.nickname}: ${e.message}`,
        );
      }
    }

    await this.sendTerminalList();
    return true;
  }

  @UsePipes(new WsValidationPipe())
  @SubscribeMessage('updateTerminal')
  async handleUpdate(@MessageBody() terminal: UpdateTerminalDto) {
    try {
      await this.terminalService.update(terminal);
      const updatedTerminal = await this.terminalService.getOne({
        terminal_id: terminal.id,
      });
      this.server.emit('terminalUpdated', updatedTerminal);
      return true;
    } catch (error) {
      console.error('Error updating KKT:', error);
      return false;
    }
  }

  /*
  @SubscribeMessage('createFN')
  async handleCreateFN(
    @MessageBody() { card, uid_kkt }: { card: Card; uid_kkt: string },
  ) {
    try {
      const kkt = await this.terminalService.attachCard(uid_kkt, card);
      this.server.emit('terminalUpdated', kkt);
      return true;
    } catch (error) {
      console.error('Error creating FN:', error);
      return false;
    }
  }
*/
  async sendTerminalList() {
    const terminals = await this.terminalService.getAll();
    this.server.emit('terminalList', terminals);
  }
}
