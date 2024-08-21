import { Server } from "socket.io";
import http from "http";

export class SocketService {
  private io: Server;

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
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
