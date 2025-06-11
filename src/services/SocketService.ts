import { Server } from "socket.io";
import http from "http";
import { allowedOrigin } from "../constants";

export class SocketService {
  private io: Server;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: allowedOrigin,
        credentials: true,
      },
    });
  }

  public getIO() {
    return this.io;
  }

  public emitToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }
}
