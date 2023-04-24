import { AbstractEntity } from '../utils/utils.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Relation,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Conversation extends AbstractEntity {
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

export type ContentType = 'TEXT' | 'IMAGE_URL';

@Entity()
export class Message extends AbstractEntity {
  @Column()
  content: string;

  @Column({ default: 'TEXT' })
  contentType: ContentType;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  conversation: Conversation;
}
