import {
	CommentResponseDTO,
	PostResponseDTO,
	ReplyResponseDTO,
} from '../dtos/post.dto';
import { Comment, Post, Reply } from './post.entity';
import { Converter, Mapper } from 'typevert';
import { UserMapper } from '../users/user.mapper';
import { User } from 'src/users/user.entity';

export class LikedByMapper extends Converter<User[], boolean> {
	convert(source?: User[]): boolean {
		return source ? source.length > 0 : false;
	}
}

@Mapper({ sourceType: Reply, targetType: ReplyResponseDTO }, [
	{
		source: 'id',
		target: 'id',
	},
	{
		source: 'createdAt',
		target: 'createdAt',
	},
	{
		source: 'updatedAt',
		target: 'updatedAt',
	},
	{
		source: 'content',
		target: 'content',
	},
	{
		source: 'author',
		target: 'author',
		converter: UserMapper,
	},
	{
		source: 'likes',
		target: 'likes',
	},
])
export class ReplyMapper extends Converter<Reply, ReplyResponseDTO> {}

@Mapper({ sourceType: Comment, targetType: CommentResponseDTO }, [
	{
		source: 'id',
		target: 'id',
	},
	{
		source: 'createdAt',
		target: 'createdAt',
	},
	{
		source: 'updatedAt',
		target: 'updatedAt',
	},
	{
		source: 'content',
		target: 'content',
	},
	{
		source: 'author',
		target: 'author',
		converter: UserMapper,
	},
	{
		source: 'replies',
		target: 'replies',
		isCollection: true,
		converter: ReplyMapper,
	},
	{
		source: 'likes',
		target: 'likes',
	},
])
export class CommentMapper extends Converter<Comment, CommentResponseDTO> {}

@Mapper({ sourceType: Post, targetType: PostResponseDTO }, [
	{
		source: 'id',
		target: 'id',
	},
	{
		source: 'createdAt',
		target: 'createdAt',
	},
	{
		source: 'updatedAt',
		target: 'updatedAt',
	},
	{
		source: 'content',
		target: 'content',
	},
	{
		source: 'contentType',
		target: 'contentType',
	},
	{
		source: 'author',
		target: 'author',
		converter: UserMapper,
	},
	{
		source: 'comments',
		target: 'comments',
		converter: CommentMapper,
		isCollection: true,
	},
	{
		source: 'likes',
		target: 'likes',
	},
	{
		source: 'likedBy',
		target: 'liked',
		converter: UserMapper,
	},
	{
		source: 'likedBy',
		target: 'liked',
		converter: LikedByMapper,
	},
])
export class PostMapper extends Converter<Post, PostResponseDTO> {}
