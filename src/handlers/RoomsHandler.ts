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

    if (!user || !room) return callback(false);

    console.log("room!.game_state::", room!.game_state);
    console.log("room!.password::", room!.password !== data.password);

    if (room!.game_state) return callback(false); // if game_state is true (started)

    if (room!.limit_of_users == room!.users.length) return callback(false); // if limit is reached
    if (room!.password !== data.password) return callback(false); // if password doesn't match

    // Check if the user is already in the room
    const userInRoom = room!.users.find((u) => u.id === user!.id);

    console.log("userInRoom::", userInRoom);

    if (userInRoom) return callback(false);

    room!.users.push(user);
    await roomService.updateRoom(room!.id, room);

    _socket.join(room!.id.toString());

    console.log(`${user.name} entrou na sala`);
    chatHandler.systemMessage({
      roomId: room.id,
      message: `${user?.name} entou na sala!`,
    });
    return callback(true);
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

    // if (room.owner_ip !== user?.ip_address) {
    //   chatHandler.systemMessage({
    //     roomId: room.id,
    //     message: `${user?.name} is a cheater!`,
    //   });
    // }
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
