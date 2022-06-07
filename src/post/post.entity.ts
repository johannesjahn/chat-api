import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  content: string;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
  post: Post;

  @OneToMany(() => Reply, (reply) => reply.comment)
  replies: Reply[];

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  author: User;
}

@Entity('reply')
export class Reply {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  content: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: false })
  comment: Comment;

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  author: User;
}
