import { Server, Socket } from "socket.io";
import { RoomService } from "../services/RoomService";

const roomService = new RoomService();
let _socket: Socket;
let _io: Server;

export const chatHandler = {
  chat: async (
    data: { roomId: number; message: string },
    callback: Function
  ) => {
    const chatMessage = await roomService.saveChatMessage(
      data.roomId,
      _socket.handshake.address,
      data.message
    );
    return callback({ chatMessage, system: false });
  },
  systemMessage: async (
    data: { roomId: number; message: string },
    callback?: Function
  ) => {
    _io
      .to(data.roomId.toString())
      .emit("receiveMessageSystem", { message: data.message, system: true });
  },
};

export const startChatHandler = async (socket: Socket, io: Server) => {
  _socket = socket;
  _io = io;

  Object.entries(chatHandler).forEach(([eventName, handlerFn]) => {
    socket.on(`room:${eventName}`, (data: any, callback: Function) => {
      handlerFn(data, callback);
    });
  });
};
