import { Socket } from "socket.io";

export interface gameData {
  player: {
    id: number;
    ip: string;
    name: string;
    socket: Socket
  };
  roomId: string;
}

export interface GameObserver {
  update: (event: string, data: gameData) => void;
}

export interface IRoomHandler {
  getRooms: () => () => Promise<void>;
}

