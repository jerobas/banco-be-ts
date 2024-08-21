import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./User";
import { ChatMessage } from "./ChatMessage";
import { RoomCard } from "./RoomCard";

@Entity()
export class Room extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password!: string;

  @Column({ type: "int", default: 0 })
  turn!: number;

  @Column({ type: "varchar", length: 255 })
  owner_ip!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "current_user_turn" })
  current_user_turn!: User | null;

  @Column("varchar", { array: true, default: [] })
  sequence!: string[];

  @Column({ type: "boolean", default: false })
  game_state!: boolean; // false = waiting, true = on game/finished

  @Column({ type: "int", default: 4 })
  limit_of_users!: number;

  @OneToMany(() => User, (user) => user.room)
  @JoinColumn({ name: "users" })
  users!: User[];

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.room)
  chatMessages!: ChatMessage[];

  @OneToMany(() => RoomCard, (roomCard) => roomCard.room)
  roomCards!: RoomCard[];

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at!: Date;
}
