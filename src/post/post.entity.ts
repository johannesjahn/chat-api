import { AbstractEntity } from '../utils/utils.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
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
}
