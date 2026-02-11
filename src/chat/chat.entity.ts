import { AbstractEntity } from '../utils/utils.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, Relation } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Conversation extends AbstractEntity {
	@Column({ nullable: true })
	title?: string;

	@ManyToMany(() => User, (user) => user.conversations, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	participants: User[];

	@OneToMany(() => Message, (message) => message.conversation)
	messages: Message[];

	@JoinColumn()
	@OneToOne(() => Message, { onDelete: 'CASCADE', nullable: true })
	lastMessage: Relation<Message> | null;
}

export const ContentTypeValues = ['TEXT', 'IMAGE_URL', 'AUDIO_URL'] as const;
export type ContentType = (typeof ContentTypeValues)[number];

@Entity()
export class Message extends AbstractEntity {
	@Column()
	content: string;

	@Column({ default: 'TEXT' })
	contentType: ContentType;

	@ManyToMany(() => User, (user) => user.readMessages, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	readBy: User[];

	@ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
	author: User;

	@ManyToOne(() => Conversation, (conversation) => conversation.messages, {
		onDelete: 'CASCADE',
	})
	conversation: Conversation;
}
