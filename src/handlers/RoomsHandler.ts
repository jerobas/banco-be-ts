import { Socket } from "socket.io";
import { RoomService } from "../services/RoomService";
import { UserService } from "../services/UserService";
import { chatHandler } from "./ChatHandler";
const roomService = new RoomService();
const userService = new UserService();

let _socket: Socket; //response quem perguntou

export const roomHandler = {
  getRooms: async (_: any, callback: Function) => {
    const rooms = await roomService.getAllRooms();
    return callback(rooms);
  },
  join: async (
    data: { name: string; password: string },
    callback: Function
  ) => {
    const room = await roomService.getRoomByName(data.name);
    const user = await userService.getUserByIp(_socket.handshake.address);

    if (!user || !room) return callback({ flag: false });

    if (room!.game_state) return callback({ flag: false }); // if game_state is true (started)

    if (room!.limit_of_users == room!.users.length)
      return callback({ flag: false }); // if limit is reached
    if (room!.password !== data.password) return callback({ flag: false }); // if password doesn't match

    // Check if the user is already in the room
    const userInRoom = room!.users.find((u) => u.id === user!.id);

    if (userInRoom) return callback({ flag: false });

    room!.users.push(user);
    await roomService.updateRoom(room!.id, room);

    _socket.join(room!.id.toString());
    return callback({ flag: true });
  },
  updateUserInGameIfReload: async (
    data: { id: number },
    callback?: Function
  ) => {
    const room = await roomService.getRoomById(data.id);
    if (!room) return _socket.emit("error", "This room does not exist");
    room?.users.forEach((user) => {
      if (user.socket_id == _socket.id) {
        _socket.join(room.id.toString());
        chatHandler.systemMessage({
          roomId: room.id,
          message: `${user.name} joined!`,
        });
      }
    });
    const user = await userService.getUserByIp(room.owner_ip);
    if (callback)
      callback({
        room,
        board_size: Number(process.env.BOARD_SIZE),
        owner: user,
      });
    else return;
  },
  setup: async (data: { id: number }, callback: Function) => {
    const room = await roomService.getRoomById(data.id);
    const user = await userService.getUserByIp(_socket.handshake.address);

    if (!room) {
      return _socket.emit("error", "This room does not exist");
    }
    return callback({
      room: room,
      owner: user,
      board_size: Number(process.env.BOARD_SIZE),
      has_password: !!room.password,
    });
  },
};

export const startRoomHandler = async (socket: Socket) => {
  _socket = socket;

  Object.entries(roomHandler).forEach(([eventName, handlerFn]) => {
    socket.on(`rooms:${eventName}`, (data: any, callback: Function) => {
      handlerFn(data, callback);
    });
  });
};
