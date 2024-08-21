import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Room } from "./Room";
import { ChatMessage } from "./ChatMessage";

@Entity()
export class User {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  socket_id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  ip_address!: string;

  @Column({ type: "numeric", precision: 10, default: 500.0 })
  money!: number;

  @Column({ type: "int", default: 0 })
  position!: number;

  @Column({ type: "int", default: 0 })
  numberOfEqualDices!: number;

  @Column({ type: "boolean", default: true })
  player_state!: boolean; // false = jail, true = free

  // @ManyToOne(() => Room, (room) => room.current_user_turn, { nullable: true })
  // @JoinColumn({ name: "current_user_turn" })
  // currentRoomTurn!: Room | null;

  @ManyToOne(() => Room, (room) => room.users)
  @JoinColumn({ name: "room_id" })
  room!: Room;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.user)
  chatMessages!: ChatMessage[];

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at!: Date;
}
