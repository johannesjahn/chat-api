import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDTO {
  @ApiProperty({ description: 'The content of a post' })
  content: string;
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
