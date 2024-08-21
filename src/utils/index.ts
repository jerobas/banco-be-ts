import { Server } from "socket.io";
import { Room } from "../db/entities/Room";
import { UserService } from "../services/UserService";

const userService = new UserService();

export const handleDices = () => {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return d1 + d2;
};

export const handleJail = (
  _io: Server,
  room: Room,
  dices: number[],
  nextTurn: number
) => {
  const promise = [];
  if (dices[0] === dices[1]) {
    promise.push(
      userService.updateUserFields(room.current_user_turn!.id, {
        player_state: false,
      })
    );
    _io
      .to(room.current_user_turn!.socket_id.toString())
      .emit("eventMessage", "Você foi solto meu amigo!");

    nextTurn = room.turn;
  } else {
    promise.push(
      userService.updateUserFields(room.current_user_turn!.id, {
        player_state: true,
      })
    );
    _io
      .to(room.current_user_turn!.socket_id.toString())
      .emit("eventMessage", "Não foi dessa vez");
  }
  return { promises: promise, nextTurn: nextTurn };
};

export const handleMoveToJail = (_io: Server, room: Room) => {
  let promise = [];
  promise.push(
    userService.updateUserFields(room.current_user_turn!.id, {
      numberOfEqualDices: 0,
      position: 30,
      player_state: false,
    })
  );
  _io
    .to(room.current_user_turn!.socket_id.toString())
    .emit("eventMessage", "Você foi preso meu amigo!");

  return promise;
};

export const handleMove = (
  _io: Server,
  room: Room,
  dices: number[],
  nextTurn: number
) => {
  let promise = [];
  if (dices[0] === dices[1]) {
    nextTurn = room.turn;
  }
  promise.push(
    userService.updateUserFields(room.current_user_turn!.id, {
      numberOfEqualDices:
        dices[0] === dices[1]
          ? room.current_user_turn!.numberOfEqualDices + 1
          : 0,
      position: (dices[0] + dices[1] + room.current_user_turn!.position) % 40,
      money:
        dices[0] + dices[1] + room.current_user_turn!.position >= 40
          ? room.current_user_turn!.money + 200
          : room.current_user_turn!.money,
    })
  );
  return { promises: promise, nextTurn: nextTurn };
};
