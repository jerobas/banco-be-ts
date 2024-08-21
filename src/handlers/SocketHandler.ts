import { Socket } from "socket.io";
import { UserService } from "../services/UserService";

export const socketHandler = async (socket: Socket): Promise<void> => {
  const userService = new UserService();

  const socketExists = await userService.getUserByIp(socket.handshake.address);

  if (socketExists) {
    await userService.updateSocketId(socketExists?.id, socket.id);
  }
};
