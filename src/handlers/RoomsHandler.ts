import { Server, Socket } from "socket.io";
import { RoomService } from "../services/RoomService";
import { UserService } from "../services/UserService";
import { chatHandler } from "./ChatHandler";
const roomService = new RoomService();
const userService = new UserService();

let _socket: Socket; //response quem perguntou
let _io: Server; //responde geral

export const roomHandler = {
  getRooms: async (_: any, callback: Function) => {
    const rooms = await roomService.getAllRooms();
    callback(rooms);
  },
  // join: async (
  //   data: { name: string; password: string },
  //   callback: Function
  // ) => {
  //   let room = await roomService.getRoomByName(data.name);
  //   let user = await userService.getUserByIp(_socket.handshake.address);

  //   if (!user && !room) callback(false);

  //   if (room!.game_state) callback(false); // if game_state is true (started)

  //   if (room!.limit_of_users == room!.users.length) callback(false); // if limit is reached
  //   if (room!.password !== data.password) callback(false); // if password doesn't match

  //   // Check if the user is already in the room
  //   const userInRoom = room!.users.find((u) => u.id === user!.id);

  //   if (userInRoom) callback(false);

  //   room!.users.push(user);
  //   await roomService.updateRoom(room!.id, room);

  //   _socket.join(room.id.toString());
  //   _socket.emit("joined", true);

  //   await roomHandler.getRooms();
  // },
  updateUserInGameIfReload: async (id: number) => {
    const room = await roomService.getRoomById(id);
    if (!room) return _socket.emit("error", "This room does not exist");
    room?.users.forEach((user) => {
      if (user.socket_id == _socket.id) {
        _socket.join(room.id.toString());
        chatHandler.systemMessage(room.id, `${user.name} joined!`);
      }
    });
    return;
  },
  setup: async (id: number, callback: Function) => {
    const room = await roomService.getRoomById(id);
    const user = await userService.getUserByIp(_socket.handshake.address);

    if (!room) {
      return _socket.emit("error", "This room does not exist");
    }

    if (room.owner_ip !== user?.ip_address) {
      chatHandler.systemMessage(room.id, `${user?.name} is a cheater!`);
    }

    return callback({
      room: room,
      owner: user,
      board_size: Number(process.env.BOARD_SIZE),
    });
    // return _io.to(room.id.toString()).emit("setup", {
    //   room: room,
    //   owner: user,
    //   board_size: Number(process.env.BOARD_SIZE),
    // });
  },
};

export const startRoomHandler = async (socket: Socket, io: Server) => {
  _socket = socket;
  _io = io;

  Object.keys(roomHandler).forEach((handler) => {
    socket.on(`rooms:${handler}`, (roomHandler as any)[handler]);
  });
};
