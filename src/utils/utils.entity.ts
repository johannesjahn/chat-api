import { PrimaryGeneratedColumn } from 'typeorm';
import { DbAwareCreateDateColumn, DbAwareUpdateDateColumn } from './utils';

export abstract class AbstractEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@DbAwareCreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@DbAwareUpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
