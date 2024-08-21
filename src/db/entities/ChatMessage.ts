import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Room } from "./Room";
import { User } from "./User";
@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  message!: string;

  @ManyToOne(() => Room, (room) => room.chatMessages)
  @JoinColumn({ name: "room_id" })
  room!: Room;

  @ManyToOne(() => User, (user) => user.chatMessages, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "varchar", length: 255 })
  user_ip_address!: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at!: Date;
}
