import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { exception } from 'console';
import { CreateConversationRequestDTO } from '../dtos/conversation.dto';
import { User } from '../users/user.entity';
import { Repository, MoreThan, FindConditions } from 'typeorm';
import { Conversation, Message } from './chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createOne(
    createrId: number,
    request: CreateConversationRequestDTO,
  ): Promise<Conversation> {
    const partnerUser = await this.userRepository.findOne(request.partnerId);
    if (!partnerUser) throw exception('Partner not found');
    const creater = await this.userRepository.findOne(createrId);

    const conversation = new Conversation();
    conversation.participants = [creater, partnerUser];
    const t = await this.conversationRepository.save(conversation);

    return t;
  }

  async getConversationListForUser(userId: number) {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'user')
      .where(
        'conversation.id in (SELECT "conversationId" FROM conversation_participants_user WHERE "userId" = :id)',
        { id: userId },
      )
      .getMany();
  }

  async sendMessage(userId: number, conversationId: number, content: string) {
    const user = await this.userRepository.findOne(userId);
    const conversation = await this.conversationRepository.findOne(
      conversationId,
      { relations: ['participants'] },
    );
    if (!conversation.participants.some((usr) => usr.id == userId))
      throw exception('HELP');
    const message = new Message();
    message.author = user;
    message.content = content;
    message.conversation = conversation;
    const result = await this.messageRepository.save(message);
    return result;
  }

  async getMessages(
    userId: number,
    conversationId: number,
    lastMessage?: number,
  ) {
    const conversation = await this.conversationRepository.findOne(
      conversationId,
      { relations: ['participants'] },
    );
    if (!conversation.participants.some((usr) => usr.id == userId))
      throw exception('HELP');

    let findConditions: FindConditions<Message>;

    if (lastMessage) {
      findConditions = {
        conversation: conversation,
        id: MoreThan(lastMessage),
      };
    } else {
      findConditions = { conversation: conversation };
    }

    const m = await this.messageRepository.find({
      where: findConditions,
      relations: ['author'],
    });

    conversation.messages = m;
    return conversation;
  }
}
