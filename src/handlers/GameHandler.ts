import { Server, Socket } from "socket.io";
import { RoomService } from "../services/RoomService";
import { UserService } from "../services/UserService";
import {
  handleJail,
  handleMove,
  handleMoveToJail,
  handleDices,
} from "../utils/index";

const roomService = new RoomService();
const userService = new UserService();

let _socket: Socket;
let _io: Server;

async function updateTurn(roomId: number) {}

export const gameHandler = {
  start: async (roomId: number) => {
    let room = await roomService.getRoomById(roomId);

    const order = [];

    if (!room) {
      return _socket.emit("error", "This room does not exist");
    }

    for (let player = 0; player < room?.users.length; player++) {
      order.push({
        user: room?.users[player],
        order: handleDices(),
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

    let updatedRoom = await roomService.updateRoom(room.id, room);

    return _io.to(room.id.toString()).emit("gameStateUpdated", {
      diceWinners: updatedRoom.sequence,
      type: updatedRoom.game_state,
      room: updatedRoom,
    });
  },
  rollDices: async (data: { roomId: number; dices: number[] }) => {
    let promises: Promise<any>[] = [];
    let room = await roomService.getRoomById(data.roomId);

    let nextTurn = room!.turn + 1;

    if (!room!.current_user_turn!.player_state) {
      const { promises: jailPromises, nextTurn: updatedTurn } = handleJail(
        _io,
        room!,
        data.dices,
        nextTurn
      );
      promises = jailPromises;
      nextTurn = updatedTurn;
    } else if (
      data.dices[0] === data.dices[1] &&
      room!.current_user_turn!.numberOfEqualDices == 2
    ) {
      promises = handleMoveToJail(_io, room!);
    } else {
      const { promises: movePromises, nextTurn: updatedTurn } = handleMove(
        _io,
        room!,
        data.dices,
        nextTurn
      );
      promises = movePromises;
      nextTurn = updatedTurn;
    }
    await Promise.all(promises);

    if (nextTurn == room?.users.length) {
      nextTurn = 0;
    }

    _io.to(data.roomId.toString()).emit("playersStates", {
      users: room?.users,
      currentTurn: room?.current_user_turn,
    });

    room!.turn = nextTurn;
    await roomService.updateRoom(room!.id, room!);
  },
};

export const startGameHandler = async (socket: Socket, io: Server) => {
  _socket = socket;
  _io = io;

  Object.keys(gameHandler).forEach((handler) => {
    socket.on(`game:${handler}`, (gameHandler as any)[handler]);
  });
};
