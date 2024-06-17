import { AbstractEntity } from '../utils/utils.entity';
import {
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ContentType } from 'src/chat/chat.entity';

@Entity('post')
export class Post extends AbstractEntity {
	@Column()
	content: string;

	@Column({ default: 'TEXT' })
	contentType: ContentType;

	@ManyToOne(() => User, (user) => user.posts)
	author: User | undefined;

	@OneToMany(() => Comment, (comment) => comment.post, { onDelete: 'CASCADE' })
	comments: Comment[];

	@Column({ default: 0 })
	likes: number;

	@ManyToMany(() => User, (user) => user.likedPosts, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	likedBy: User[];
}

@Entity('comment')
export class Comment extends AbstractEntity {
	@Column()
	content: string;

	@ManyToOne(() => Post, (post) => post.comments, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	post: Post;

	@OneToMany(() => Reply, (reply) => reply.comment)
	replies: Reply[];

	@ManyToOne(() => User, (user) => user.posts, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	author: User | undefined;

	@Column({ default: 0 })
	likes: number;

	@ManyToMany(() => User, (user) => user.likedPosts, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	likedBy: User[];
}

@Entity('reply')
export class Reply extends AbstractEntity {
	@Column()
	content: string;

	@ManyToOne(() => Comment, (comment) => comment.replies, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	comment: Comment;

	@ManyToOne(() => User, (user) => user.posts, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	author: User | undefined;

	@Column({ default: 0 })
	likes: number;

	@ManyToMany(() => User, (user) => user.likedPosts, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	likedBy: User[];
}
