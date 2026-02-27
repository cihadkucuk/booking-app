import { Injectable, Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@Injectable()
@WebSocketGateway({
  namespace: "/ws",
  cors: {
    origin: true,
    credentials: true
  }
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket): void {
    const studioId = String(client.handshake.query.studioId ?? "");
    if (studioId) {
      void client.join(`studio:${studioId}`);
    }
    this.logger.debug(`socket connected ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`socket disconnected ${client.id}`);
  }

  publishAppointmentUpdate(studioId: string, payload: Record<string, unknown>): void {
    this.server.to(`studio:${studioId}`).emit("appointment.updated", payload);
  }

  publishInboxUpdate(studioId: string, payload: Record<string, unknown>): void {
    this.server.to(`studio:${studioId}`).emit("inbox.updated", payload);
  }
}

