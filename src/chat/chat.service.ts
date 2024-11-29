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

	async createConversation(creatorId: number, request: CreateConversationRequestDTO): Promise<Conversation> {
		if (request.partnerIds.length === 0) throw new HttpException({ error: "Can't create chat with self" }, 400);

		const partnerUsers = await this.userRepository.find({
			where: request.partnerIds.map((id) => ({ id })),
		});

		if (partnerUsers.length !== request.partnerIds.length) throw new HttpException({ error: 'User not found' }, 404);
		if (request.partnerIds.findIndex((v) => v === creatorId) !== -1)
			throw new HttpException({ error: "Can't create chat with self" }, 400);
		const creator = await this.userRepository.findOne({
			where: { id: creatorId },
		});
		if (!creator) {
			throw new HttpException({ error: 'Could not find creator by ID' }, 404);
		}
		if (partnerUsers.length === 1) {
			const existingConversations = await this.conversationRepository
				.createQueryBuilder('conversation')
				.leftJoinAndSelect('conversation.participants', 'user')
				.where(
					'conversation.id in (SELECT "conversationId" FROM conversation_participants_user WHERE "userId" = :id)',
					{ id: creatorId },
				)
				.getMany();

			existingConversations.forEach((value) => {
				if (
					value.participants.length === 2 &&
					(value.participants[1].id === partnerUsers[0].id || value.participants[0].id === partnerUsers[0].id)
				) {
					throw new HttpException({ error: 'Single conversation with that user already exists' }, 400);
				}
			});
		}

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
			.leftJoinAndSelect('message.readBy', 'readBy')
			.where('conversation.id in (SELECT "conversationId" FROM conversation_participants_user WHERE "userId" = :id)', {
				id: userId,
			})
			.orderBy({ 'conversation.updatedAt': 'DESC' })
			.getMany();
	}

	async sendMessage(userId: number, conversationId: number, content: string, contentType: ContentType) {
		if (contentType == 'IMAGE_URL' && !content.startsWith('http')) {
			throw new HttpException({ error: 'Invalid image url' }, 400);
		}

		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new HttpException({ error: 'Could not find user' }, 404);
		}
		const conversation = await this.conversationRepository.findOne({
			where: { id: conversationId },
			relations: ['participants'],
		});
		if (!conversation) {
			throw new HttpException({ error: 'Could not find conversation' }, 404);
		}
		if (!conversation.participants.some((usr) => usr.id == userId)) {
			throw new HttpException({ error: 'No access' }, 403);
		}
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

	async getMessages(userId: number, conversationId: number, lastMessage?: number) {
		const conversation = await this.conversationRepository.findOne({
			where: { id: conversationId },
			relations: ['participants', 'lastMessage', 'lastMessage.author', 'lastMessage.readBy'],
		});
		if (!conversation) {
			throw new HttpException({ error: 'No conversation found' }, 404);
		}
		if (!conversation.participants.some((usr) => usr.id == userId))
			throw new HttpException({ error: 'No access' }, 403);

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
			relations: ['author', 'readBy'],
		});

		conversation.messages = m;
		return conversation;
	}

	async markMessageAsRead(userId: number, messageId: number) {
		const message = await this.messageRepository.findOne({
			where: { id: messageId },
			relations: ['author', 'readBy', 'conversation', 'conversation.participants'],
		});
		if (!message) {
			throw new HttpException({ error: 'No message found' }, 404);
		}
		if (!message.conversation.participants.some((usr) => usr.id == userId))
			throw new HttpException({ error: 'No access' }, 403);

		if (message.author.id == userId) return;

		const user = message.conversation.participants.find((usr) => usr.id == userId)!;

		if (!message.readBy.some((usr) => usr.id == userId)) {
			message.readBy.push(user);
			await this.messageRepository.save(message);
		}

		this.chatGateway.updateConversationsForUsers(
			message.conversation.participants.map((p) => p.id).filter((id) => id != userId),
			message.conversation.id,
		);
	}

	async markConversationAsRead(userId: number, conversationId: number) {
		const conversation = await this.conversationRepository.findOne({
			where: { id: conversationId },
			relations: ['participants', 'messages', 'messages.author', 'messages.readBy'],
		});
		if (!conversation) {
			throw new HttpException({ error: 'No conversation found' }, 404);
		}
		if (!conversation.participants.some((usr) => usr.id == userId))
			throw new HttpException({ error: 'No access' }, 403);

		const user = conversation.participants.find((usr) => usr.id == userId)!;

		let changed = false;

		conversation.messages.forEach((message) => {
			if (!message.readBy.some((usr) => usr.id == userId) && message.author.id != userId) {
				message.readBy.push(user);
				changed = true;
			}
		});

		if (!changed) return;

		await this.messageRepository.save(conversation.messages);

		this.chatGateway.updateConversationsForUsers(
			conversation.participants.map((p) => p.id).filter((id) => id != userId),
			conversation.id,
		);
	}

	async getUnreadMessagesCount(userId: number) {
		const conversations = await this.conversationRepository
			.createQueryBuilder('conversation')
			.leftJoinAndSelect('conversation.participants', 'user')
			.leftJoinAndSelect('conversation.messages', 'message')
			.leftJoinAndSelect('message.author', 'author')
			.leftJoinAndSelect('message.readBy', 'readBy')
			.where('conversation.id in (SELECT "conversationId" FROM conversation_participants_user WHERE "userId" = :id)', {
				id: userId,
			})
			.orderBy({ 'conversation.updatedAt': 'DESC' })
			.getMany();

		return conversations.reduce((prev, curr) => {
			const unread = curr.messages.filter((m) => m.author.id != userId && !m.readBy.some((u) => u.id == userId));
			return prev + unread.length;
		}, 0);
	}

	async hasUnreadMessages(userId: number) {
		const conversations = await this.getConversationListForUser(userId);
		const result = conversations.some((c) => {
			const unread = c.lastMessage?.author.id != userId && !c.lastMessage?.readBy.some((u) => u.id == userId);
			return unread;
		});

		return result;
	}

	async setConversationTitle(userId: number, conversationId: number, title: string) {
		const conversation = await this.conversationRepository.findOne({
			where: { id: conversationId },
			relations: ['participants'],
		});
		if (!conversation) {
			throw new HttpException({ error: 'No conversation found' }, 404);
		}
		if (conversation.participants.length < 3) {
			throw new HttpException({ error: 'Cannot set title for non group conversations' }, 400);
		}
		if (!conversation.participants.some((usr) => usr.id == userId))
			throw new HttpException({ error: 'No access' }, 403);

		conversation.title = title;
		await this.conversationRepository.save(conversation);
		return conversation;
	}
}
