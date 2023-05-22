import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateConversationRequestDTO } from '../dtos/conversation.dto';
import { User } from '../users/user.entity';
import { Repository, MoreThan, FindOptionsWhere } from 'typeorm';
import { ContentType, Conversation, Message } from './chat.entity';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async createConversation(
    creatorId: number,
    request: CreateConversationRequestDTO,
  ): Promise<Conversation> {
    if (request.partnerIds.length === 0)
      throw new HttpException("Can't create chat with self", 400);

    const partnerUsers = await this.userRepository.find({
      where: request.partnerIds.map((id) => ({ id })),
    });

    if (partnerUsers.length !== request.partnerIds.length)
      throw new HttpException('User not found', 404);
    if (request.partnerIds.findIndex((v) => v === creatorId) !== -1)
      throw new HttpException("Can't create chat with self", 400);
    const creator = await this.userRepository.findOne({
      where: { id: creatorId },
    });

    const conversation = new Conversation();
    conversation.participants = [creator, ...partnerUsers];
    const t = await this.conversationRepository.save(conversation);

    return t;
  }

  async getConversationListForUser(userId: number) {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'user')
      .leftJoinAndSelect('conversation.lastMessage', 'message')
      .leftJoinAndSelect('message.author', 'author')
      .where(
        'conversation.id in (SELECT "conversationId" FROM conversation_participants_user WHERE "userId" = :id)',
        { id: userId },
      )
      .orderBy({ 'conversation.updatedAt': 'DESC' })
      .getMany();
  }

  async sendMessage(
    userId: number,
    conversationId: number,
    content: string,
    contentType: ContentType,
  ) {
    if (contentType == 'IMAGE_URL' && !content.startsWith('http')) {
      throw new HttpException('Invalid image url', 400);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    if (!conversation.participants.some((usr) => usr.id == userId))
      throw new HttpException('No access', 403);
    const message = new Message();
    message.author = user;
    message.content = content;
    message.conversation = conversation;
    message.contentType = contentType;
    const result = await this.messageRepository.save(message);
    conversation.lastMessage = result;
    await this.conversationRepository.save({
      ...conversation,
      lastMessage: result,
    });
    this.chatGateway.updateMessagesForUsers(
      conversation.participants.map((p) => p.id).filter((id) => id != userId),
      conversationId,
    );
    return result;
  }

  async getMessages(
    userId: number,
    conversationId: number,
    lastMessage?: number,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'lastMessage', 'lastMessage.author'],
    });
    if (!conversation) {
      throw new HttpException('No conversation found', 404);
    }
    if (!conversation.participants.some((usr) => usr.id == userId))
      throw new HttpException('No access', 403);

    let findConditions: FindOptionsWhere<Message>;

    if (lastMessage) {
      findConditions = {
        conversation: { id: conversationId },
        id: MoreThan(lastMessage),
      };
    } else {
      findConditions = { conversation: { id: conversationId } };
    }

    const m = await this.messageRepository.find({
      where: findConditions,
      relations: ['author'],
    });

    conversation.messages = m;
    return conversation;
  }
}
