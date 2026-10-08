import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CompanyService } from './company.service';

@WebSocketGateway({
  cors: true,
  transport: ['websocket'],
  namespace: 'company',
})
export class CompanyGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly companyService: CompanyService) {}

  async handleConnection(client: Socket) {
    //connetct
  }

  handleDisconnect(client: Socket) {
    //console.log(`Client disconnected: ${client.id}`);
  }
}
