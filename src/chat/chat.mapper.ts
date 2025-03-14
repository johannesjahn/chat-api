import { Conversation, Message } from './chat.entity';
import { Converter, Mapper } from 'typevert';
import { ConversationResponseDTO, MessageResponseDTO } from '../dtos/chat.dto';
import { UserMapper } from '../users/user.mapper';

@Mapper({ sourceType: Message, targetType: MessageResponseDTO }, [
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
		source: 'contentType',
		target: 'contentType',
	},
	{
		source: 'readBy',
		target: 'readBy',
		converter: UserMapper,
		isCollection: true,
	},
])
export class MessageMapper extends Converter<Message, MessageResponseDTO> {}

@Mapper({ sourceType: Conversation, targetType: ConversationResponseDTO }, [
	{
		source: 'id',
		target: 'id',
	},
	{
		source: 'title',
		target: 'title',
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
		source: 'participants',
		target: 'participants',
		converter: UserMapper,
		isCollection: true,
	},
	{
		source: 'messages',
		target: 'messages',
		converter: MessageMapper,
		isCollection: true,
	},
	{
		source: 'lastMessage',
		target: 'lastMessage',
		converter: MessageMapper,
	},
])
export class ConversationMapper extends Converter<Conversation, ConversationResponseDTO> {}
