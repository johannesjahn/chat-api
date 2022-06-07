import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDTO {
  @ApiProperty()
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

export class CreateReplyDTO {
  @ApiProperty()
  commentId: number;
  @ApiProperty()
  content: string;
}
