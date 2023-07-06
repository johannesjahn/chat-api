import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserAuth {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	password: string;

	@OneToOne(() => User, (user) => user.userAuth, { onDelete: 'CASCADE' })
	user: User;
}
