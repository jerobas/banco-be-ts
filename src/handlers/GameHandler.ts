import { Server, Socket } from "socket.io";
import { RoomService } from "../services/RoomService";
import { UserService } from "../services/UserService";
import { CardService } from "../services/CardService";

import {
  handleJail,
  handleMove,
  handleMoveToJail,
  handleDices,
} from "../utils/index";

const roomService = new RoomService();
const userService = new UserService();
const cardService = new CardService();

let _socket: Socket;
let _io: Server;

async function updateTurn(roomId: number) {}

export const gameHandler = {
  start: async (data: {roomId: number}, callback: Function) => {
    const room = await roomService.getRoomById(data.roomId);

    const order = [];

    if (!room) {
      return _socket.emit("error", "This room does not exist");
    }

    const [d1, d2] = handleDices();

    for (let player = 0; player < room?.users.length; player++) {
      order.push({
        user: room?.users[player],
        order: d1 + d2,
      });
    }

    order
      .sort((a, b) => b.order - a.order)
      .map((player, index) => {
        if (index == 0) {
          room.current_user_turn = player.user;
        }
        room.sequence.push(player.user.ip_address);
      });

    room.game_state = true;

    const updatedRoom = await roomService.updateRoom(room.id, room);

    return callback({
      diceWinners: updatedRoom!.sequence,
      type: updatedRoom!.game_state,
      room: updatedRoom,
    });
  },
  buy: async (roomId: number, callback: Function) => {
    const room = await roomService.getRoomById(roomId);
    let user = await userService.getUserByIp(_socket.handshake.address);

    if (!room) {
      return _socket.emit("error", "This room does not exist");
    }

    if (user?.ip_address !== room?.current_user_turn?.ip_address)
      return _socket.emit("error", "This is not your turn");

    user = await cardService.buyCard(roomId, user!);

    return callback(user);
  },
  rollDices: async (data: { roomId: number }, callback: Function) => {
    const dices: number[] = handleDices();
    let promises: Promise<any>[] = [];
    let room = await roomService.getRoomById(data.roomId);
    const user = await userService.getUserByIp(_socket.handshake.address);

    if (user?.ip_address !== room?.current_user_turn?.ip_address)
      return _socket.emit("error", "This is not your turn");

    let nextTurn = room!.turn + 1;

    if (!room!.current_user_turn!.player_state) {
      const { promises: jailPromises, nextTurn: updatedTurn } = handleJail(
        _io,
        room!,
        dices,
        nextTurn
      );
      promises = jailPromises;
      nextTurn = updatedTurn;
    } else if (
      dices[0] === dices[1] &&
      room!.current_user_turn!.numberOfEqualDices == 2
    ) {
      promises = handleMoveToJail(_io, room!);
    } else {
      const { promises: movePromises, nextTurn: updatedTurn } = handleMove(
        _io,
        room!,
        dices,
        nextTurn
      );
      promises = movePromises;
      nextTurn = updatedTurn;
    }
    await Promise.all(promises);

    if (nextTurn == room?.users.length) {
      nextTurn = 0;
    }

    room!.turn = nextTurn;
    room = await roomService.updateRoom(room!.id, room!);

    return callback({
      users: room?.users,
      currentTurn: room?.current_user_turn,
    });
  },
};

export const startGameHandler = async (socket: Socket, io: Server) => {
  _socket = socket;
  _io = io;

  Object.entries(gameHandler).forEach(([eventName, handlerFn]) => {
    socket.on(`game:${eventName}`, (data: any, callback: Function) => {
      handlerFn(data, callback);
    });
  });
};
