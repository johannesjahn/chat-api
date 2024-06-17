import { Conversation, Message } from '../chat/chat.entity';
import { Post, Comment, Reply } from '../post/post.entity';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToMany,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAuth } from './userAuth.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	username: string;

	@Column({ nullable: true })
	avatarHash: string;

	@OneToMany(() => Message, (message) => message.author)
	messages: Message[];

	@ManyToMany(() => Conversation, (conversation) => conversation.participants, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	conversations: Conversation[];

	@ManyToMany(() => Message, (message) => message.readBy, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	readMessages: Message[];

	@OneToOne(() => UserAuth, { onDelete: 'CASCADE' })
	@JoinColumn()
	userAuth: UserAuth | undefined;

	@OneToMany(() => Post, (post) => post.author)
	posts: Post[];

	@OneToMany(() => Comment, (comment) => comment.author)
	comments: Comment[];

	@OneToMany(() => Reply, (reply) => reply.author)
	replies: Reply[];

	@ManyToMany(() => Post, (post) => post.likedBy, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	likedPosts: Post[];

	@ManyToMany(() => Comment, (comment) => comment.likedBy, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	likedComments: Comment[];

	@ManyToMany(() => Reply, (reply) => reply.likedBy, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	likedReplies: Reply[];
}
