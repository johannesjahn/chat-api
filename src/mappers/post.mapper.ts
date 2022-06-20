import {
  CommentResponseDTO,
  PostResponseDTO,
  ReplyResponseDTO,
} from '../dtos/post.dto';
import { Comment, Post, Reply } from '../post/post.entity';
import { Converter, Mapper } from 'typevert';
import { UserMapper } from './user.mapper';

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
    source: 'author',
    target: 'author',
    converter: UserMapper,
  },
  {
    source: 'comments',
    target: 'comments',
    converter: CommentMapper,
  },
])
export class PostMapper extends Converter<Post, PostResponseDTO> {}
