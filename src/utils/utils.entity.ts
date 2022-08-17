import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' }) // change to timestamptz in prod
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // change to timestamptz in prod
  updatedAt: Date;
}
