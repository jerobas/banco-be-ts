import { Server, Socket } from "socket.io";
import { RoomService } from "../services/RoomService";

const roomService = new RoomService();
let _socket: Socket;
let _io: Server;

export const chatHandler = {
  chat: async (roomId: number, message: string) => {
    const chatMessage = await roomService.saveChatMessage(
      roomId,
      _socket.handshake.address,
      message
    );
    _io.to(roomId.toString()).emit("receiveMessage", chatMessage, false);
  },
  systemMessage: async (roomId: number, message: string) => {
    _io
      .to(roomId.toString())
      .emit("receiveMessageSystem", { message: message, system: true });
  },
};

export const startChatHandler = async (socket: Socket, io: Server) => {
  _socket = socket;
  _io = io;

  Object.keys(chatHandler).forEach((handler) => {
    socket.on(`room:${handler}`, (chatHandler as any)[handler]);
  });
};
