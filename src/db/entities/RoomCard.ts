import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Room } from "./Room";
import { Card } from "./Card";

@Entity()
export class RoomCard {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Room, (room) => room.roomCards)
  @JoinColumn({ name: "room_id" })
  room!: Room;

  @ManyToOne(() => Card, (card) => card.id)
  @JoinColumn({ name: "card_id" })
  card!: Card;

  @Column({ type: "varchar", length: 255 })
  owner!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "boolean", default: false })
  on!: boolean;
}
