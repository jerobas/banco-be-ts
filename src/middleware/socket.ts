import { NextFunction, Request, Response } from "express";
import { Socket, Server as SocketIOServer } from "socket.io";

declare module "express-serve-static-core" {
  interface Request {
    io: SocketIOServer;
    user_socket: Socket;
    userIp: string;
  }
}

const socketMiddleware = (io: SocketIOServer) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const socketId = req.headers["socket-id"] as string;

    req.io = io;
    const socket = io.sockets.sockets.get(socketId);

    if (socket) {
      req.user_socket = socket as Socket;
      req.userIp = req.user_socket.handshake.address;
    }
    next();
  };
};

export default socketMiddleware;
