import { ApiProperty } from '@nestjs/swagger';
import { ContentType, ContentTypeValues } from '../chat/chat.entity';
import { UserResponseDTO } from './user.dto';

export class CreatePostDTO {
	@ApiProperty({ description: 'The content of a post' })
	content: string;

	@ApiProperty({
		description: 'The content type of a post',
		enum: ContentTypeValues,
	})
	contentType: ContentType;
}

export class ReplyResponseDTO {
	@ApiProperty({ description: 'The unique id of a reply' })
	id: number;

	@ApiProperty({ description: 'The creation date of a reply' })
	createdAt: Date;

	@ApiProperty({ description: 'The last update date of a reply' })
	updatedAt: Date;

	@ApiProperty({ description: 'The content of a reply' })
	content: string;

	@ApiProperty({ nullable: true, description: 'The author of a reply' })
	author: UserResponseDTO;

	@ApiProperty({ nullable: false, description: 'Number of likes' })
	likes: number;
}
export class CommentResponseDTO {
	@ApiProperty({ description: 'The unique id of a comment' })
	id: number;

	@ApiProperty({ description: 'The creation date of a comment' })
	createdAt: Date;

	@ApiProperty({ description: 'The last update date of a comment' })
	updatedAt: Date;

	@ApiProperty({ description: 'The content of a comment' })
	content: string;

	@ApiProperty({ nullable: true, description: 'The author of a comment' })
	author: UserResponseDTO;

	@ApiProperty({
		type: ReplyResponseDTO,
		isArray: true,
		description: 'The replies of a comment',
	})
	replies: ReplyResponseDTO[];

	@ApiProperty({ nullable: false, description: 'Number of likes' })
	likes: number;
}
export class PostResponseDTO {
	@ApiProperty({ description: 'The unique id of a post' })
	id: number;

	@ApiProperty({ description: 'The creation date of a post' })
	createdAt: Date;

	@ApiProperty({ description: 'The last update date of a post' })
	updatedAt: Date;

	@ApiProperty({ description: 'The content of a post' })
	content: string;

	@ApiProperty({
		enum: ContentTypeValues,
		description: 'The content type of a post',
	})
	contentType: ContentType;

	@ApiProperty({ nullable: true, description: 'The author of a post' })
	author: UserResponseDTO;

	@ApiProperty({
		type: CommentResponseDTO,
		isArray: true,
		nullable: true,
		description: 'The comments of a post',
	})
	comments: CommentResponseDTO[] | null;

	@ApiProperty({ nullable: false, description: 'Number of likes' })
	likes: number;

	@ApiProperty({ nullable: false, description: 'Liked by current user' })
	liked: boolean;
}

export class UpdatePostDTO {
	@ApiProperty({
		description: 'The unique id of a post',
	})
	id: number;
	@ApiProperty({
		description: 'The content of a post',
	})
	content: string;
	@ApiProperty({
		enum: ContentTypeValues,
		description: 'The content type of a post',
	})
	contentType: ContentType;
}

export class DeletePostDTO {
	@ApiProperty({ description: 'The unique id of the deleted post' })
	id: number;
}

export class CreateCommentDTO {
	@ApiProperty({ description: 'The unique id of the post' })
	postId: number;
	@ApiProperty({ description: 'The content of the comment' })
	content: string;
}

export class DeleteCommentDTO {
	@ApiProperty({ description: 'The unique id of the comment' })
	commentId: number;
}

export class UpdateCommentDTO {
	@ApiProperty({ description: 'The unique id of the comment' })
	commentId: number;
	@ApiProperty({ description: 'The content of the comment' })
	content: string;
}

export class CreateReplyDTO {
	@ApiProperty({ description: 'The unique id of the comment' })
	commentId: number;
	@ApiProperty({ description: 'The content of the reply' })
	content: string;
}

export class DeleteReplyDTO {
	@ApiProperty({ description: 'The unique id of the reply' })
	replyId: number;
}

export class UpdateReplyDTO {
	@ApiProperty({ description: 'The unique id of the reply' })
	replyId: number;
	@ApiProperty({ description: 'The content of the reply' })
	content: string;
}
