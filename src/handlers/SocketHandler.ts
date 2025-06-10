import { Socket } from "socket.io";
import cookie from "cookie";
import { UserService } from "../services/UserService";

export const socketHandler = async (socket: Socket): Promise<void> => {
  const userService = new UserService();

  const rawCookie = socket.handshake.headers.cookie;
  const cookies = cookie.parse(rawCookie || "");
  const userToken = cookies.userToken;

  const user = await userService.getUserByToken(userToken);

  if (user) {
    await userService.updateSocketId(user?.id, socket.id);
  }
};
