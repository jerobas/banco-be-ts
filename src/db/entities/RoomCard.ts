import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Room } from "./Room";
import { Card } from "./Card";
import { User } from "./User";

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

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "owner_id" })
  owner!: User | null;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "boolean", default: false })
  on!: boolean;

  @Column({ type: "int" })
  position!: number;
}
