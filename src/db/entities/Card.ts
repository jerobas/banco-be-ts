import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "varchar", length: 255 })
  illustration_url!: string;

  @Column({ type: "varchar", length: 100 })
  type!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  purchase_value!: number;

  @Column({ type: "varchar", length: 255 })
  modifiers!: string;

  @Column({ type: "boolean" })
  is_tradable!: boolean;

  @Column({ type: "boolean" })
  can_accept_modifiers!: boolean;

  @Column({ type: "int" })
  rarity_tier!: number;

  @Column({ type: "int" })
  scaling_level!: number;

  @Column({ type: "int", default: 0 })
  quantity!: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at!: Date;
}
