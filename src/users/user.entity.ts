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

  @OneToMany(() => Message, (message) => message.author)
  messages: Message[];

  @ManyToMany(() => Conversation, (conversation) => conversation.participants, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  conversations: Conversation[];

  @OneToOne(() => UserAuth, { onDelete: 'CASCADE' })
  @JoinColumn()
  userAuth: UserAuth;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Reply, (reply) => reply.author)
  replies: Reply[];
}
