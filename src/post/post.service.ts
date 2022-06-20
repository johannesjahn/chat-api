import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateCommentDTO,
  CreatePostDTO,
  CreateReplyDTO,
  UpdatePostDTO,
} from '../dtos/post.dto';
import { Repository } from 'typeorm';
import { Comment, Post, Reply } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Reply)
    private replyRepository: Repository<Reply>,
  ) {}

  async createPost(userId: number, post: CreatePostDTO) {
    const createdPost = await this.postRepository.save({
      content: post.content,
      author: { id: userId },
    });
    return createdPost;
  }

  async getPosts() {
    const result = await this.postRepository.find({
      relations: [
        'author',
        'comments',
        'comments.author',
        'comments.replies',
        'comments.replies.author',
      ],
    });
    return result;
  }

  async deletePost(userId: number, postId: number) {
    const result = await this.postRepository.delete({
      id: postId,
      author: { id: userId },
    });

    if (result.affected === 0) throw new HttpException('Post not found', 404);
    return { success: 'Post deleted' };
  }

  async updatePost(userId: number, postDTO: UpdatePostDTO) {
    const post = await this.postRepository.findOne({
      id: postDTO.id,
      author: { id: userId },
    });

    if (!post) throw new HttpException('Post not found', 404);
    post.content = postDTO.content;

    const result = await this.postRepository.update(postDTO.id, post);

    if (result.affected === 0)
      throw new HttpException('Could not update post', 400);
    return { success: 'Post updated' };
  }

  async createComment(userId: number, createCommentDTO: CreateCommentDTO) {
    const result = await this.commentRepository.save({
      author: { id: userId },
      post: { id: createCommentDTO.postId },
      content: createCommentDTO.content,
    });
    return result;
  }

  async getComments(postId: number) {
    const result = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['author', 'replies', 'replies.author'],
    });
    return result;
  }

  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, author: { id: userId } },
    });
    if (!comment) throw new HttpException('Comment not found', 404);
    comment.content = content;

    const result = await this.commentRepository.update(commentId, comment);
    if (result.affected === 0)
      throw new HttpException('Could not update comment', 400);
    return { success: 'Comment updated' };
  }

  async deleteComment(userId: number, commentId: number) {
    const result = await this.commentRepository.delete({
      id: commentId,
      author: { id: userId },
    });
    if (result.affected === 0)
      throw new HttpException('Comment not found', 404);
    return { success: 'Comment deleted' };
  }

  async createReply(userId: number, createReplyDTO: CreateReplyDTO) {
    const result = await this.replyRepository.save({
      author: { id: userId },
      comment: { id: createReplyDTO.commentId },
      content: createReplyDTO.content,
    });
    return result;
  }

  async getReplies(commentId: number) {
    const result = await this.replyRepository.find({
      where: { comment: { id: commentId } },
      relations: ['author'],
    });
    return result;
  }

  async updateReply(userId: number, replyId: number, content: string) {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId, author: { id: userId } },
    });
    if (!reply) throw new HttpException('Reply not found', 404);
    reply.content = content;

    const result = await this.replyRepository.update(replyId, reply);
    if (result.affected === 0)
      throw new HttpException('Could not update reply', 400);
    return { success: 'Reply updated' };
  }

  async deleteReply(userId: number, replyId: number) {
    const result = await this.replyRepository.delete({
      id: replyId,
      author: { id: userId },
    });
    if (result.affected === 0) throw new HttpException('Reply not found', 404);
    return { success: 'Reply deleted' };
  }
}
