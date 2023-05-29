import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../chat/chat.entity';
import { UserResponseDTO } from './user.dto';

export class CreatePostDTO {
  @ApiProperty({ description: 'The content of a post' })
  content: string;

  @ApiProperty()
  contentType: ContentType;
}

export class ReplyResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true })
  author: UserResponseDTO;
}
export class CommentResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true })
  author: UserResponseDTO;

  @ApiProperty({ type: ReplyResponseDTO, isArray: true })
  replies: ReplyResponseDTO[];
}
export class PostResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  content: string;

  @ApiProperty()
  contentType: ContentType;

  @ApiProperty({ nullable: true })
  author: UserResponseDTO;

  @ApiProperty({ type: CommentResponseDTO, isArray: true, nullable: true })
  comments: CommentResponseDTO[] | null;
}

export class UpdatePostDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  content: string;
  @ApiProperty()
  contentType: ContentType;
}

export class DeletePostDTO {
  @ApiProperty()
  id: number;
}

export class CreateCommentDTO {
  @ApiProperty()
  postId: number;
  @ApiProperty()
  content: string;
}

export class DeleteCommentDTO {
  @ApiProperty()
  commentId: number;
}

export class UpdateCommentDTO {
  @ApiProperty()
  commentId: number;
  @ApiProperty()
  content: string;
}

export class CreateReplyDTO {
  @ApiProperty()
  commentId: number;
  @ApiProperty()
  content: string;
}

export class DeleteReplyDTO {
  @ApiProperty()
  replyId: number;
}

export class UpdateReplyDTO {
  @ApiProperty()
  replyId: number;
  @ApiProperty()
  content: string;
}
