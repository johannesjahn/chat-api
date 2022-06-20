import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDTO } from './user.dto';

export class CreatePostDTO {
  @ApiProperty({ description: 'The content of a post' })
  content: string;
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

  @ApiProperty()
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

  @ApiProperty()
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
  author: UserResponseDTO;

  @ApiProperty({ type: CommentResponseDTO, isArray: true })
  comments: CommentResponseDTO[];
}

export class UpdatePostDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  content: string;
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

export class GetCommentsDTO {
  @ApiProperty()
  postId: number;
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

export class GetRepliesDTO {
  @ApiProperty()
  commentId: number;
}
