import { faker } from '@faker-js/faker';
import { createAccount, createPost, getPosts, likePost } from './utils.e2e';

describe('PostController (e2e)', () => {
	it('app/post/', async () => {
		const firstCredentials = await createAccount();

		const post = await createPost(firstCredentials.accessToken, {
			content: faker.lorem.text(),
			contentType: 'TEXT',
		});
		await likePost(firstCredentials.accessToken, post.id);

		const result = await getPosts(firstCredentials.accessToken);
		const anonymousResult = await getPosts();

		expect(result).toHaveLength(1);
		expect(result[0].likes).toBe(1);
		expect(result[0].liked).toBe(true);
		expect(result[0].numberOfComments).toBe(0);

		expect(anonymousResult).toHaveLength(1);
		expect(anonymousResult[0].likes).toBe(1);
		expect(anonymousResult[0].liked).toBe(false);
		expect(anonymousResult[0].numberOfComments).toBe(0);
	});
});
