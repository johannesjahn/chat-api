import { faker } from '@faker-js/faker';
import { ConversationResponseDTO } from 'src/dtos/chat.dto';
import { CreateConversationRequestDTO } from 'src/dtos/conversation.dto';
import * as request from 'supertest';
import { app } from './setup.e2e';
import { CreatePostDTO, PostResponseDTO } from 'src/dtos/post.dto';

export async function createAccount(): Promise<{
	username: string;
	password: string;
	accessToken: string;
	id: number;
}> {
	const username = faker.internet.userName();
	const password = faker.internet.password();

	const registerResponse = await request(app.getHttpServer())
		.post('/auth/register')
		.send({ username, password });

	const id = registerResponse.body.id;

	const loginResponse = await request(app.getHttpServer())
		.post('/auth/login')
		.send({ username, password });

	const accessToken = loginResponse.body.access_token;

	return { id, username, password, accessToken };
}

export async function createConversation(
	body: CreateConversationRequestDTO,
	accessToken: string,
): Promise<ConversationResponseDTO> {
	const response = await request(app.getHttpServer())
		.post('/chat/create-conversation')
		.set('Authorization', `Bearer ${accessToken}`)
		.send(body);

	return response.body;
}

export async function getConversations(
	accessToken: string,
): Promise<ConversationResponseDTO[]> {
	const response = await request(app.getHttpServer())
		.get('/chat/get-conversations')
		.set('Authorization', `Bearer ${accessToken}`)
		.send();

	return response.body;
}

export async function createPost(
	accessToken: string,
	body: CreatePostDTO,
): Promise<PostResponseDTO> {
	const response = await request(app.getHttpServer())
		.post('/post')
		.set('Authorization', `Bearer ${accessToken}`)
		.send(body);

	return response.body;
}

export async function getPosts(
	accessToken?: string,
): Promise<PostResponseDTO[]> {
	const response = await request(app.getHttpServer())
		.get('/post')
		.set('Authorization', `Bearer ${accessToken}`)
		.send();

	return response.body;
}

export async function getPost(
	accessToken: string,
	postId: number,
): Promise<PostResponseDTO> {
	const response = await request(app.getHttpServer())
		.get(`/post/single/${postId}`)
		.set('Authorization', `Bearer ${accessToken}`)
		.send();

	return response.body;
}

export async function likePost(accessToken: string, postId: number) {
	const response = await request(app.getHttpServer())
		.post(`/post/${postId}/like`)
		.set('Authorization', `Bearer ${accessToken}`)
		.send();

	return response.body;
}
