import { createAccount, createConversation, getConversations } from './utils.e2e';

describe('ChatController (e2e)', () => {
	it('app/chat/create-conversation (single chat) (POST)', async () => {
		const firstCredentials = await createAccount();
		const secondCredentials = await createAccount();

		await createConversation(
			{
				partnerIds: [secondCredentials.id],
			},
			firstCredentials.accessToken,
		);

		const firstConversations = await getConversations(firstCredentials.accessToken);
		const secondConversations = await getConversations(secondCredentials.accessToken);

		expect(firstConversations).toHaveLength(1);
		expect(secondConversations).toHaveLength(1);
	});

	it('app/chat/create-conversation (multi chat) (POST)', async () => {
		const firstCredentials = await createAccount();
		const secondCredentials = await createAccount();
		const thirdCredentials = await createAccount();

		await createConversation(
			{
				partnerIds: [secondCredentials.id, thirdCredentials.id],
			},
			firstCredentials.accessToken,
		);

		const firstConversations = await getConversations(firstCredentials.accessToken);
		const secondConversations = await getConversations(secondCredentials.accessToken);
		const thirdConversations = await getConversations(thirdCredentials.accessToken);

		expect(firstConversations).toHaveLength(1);
		expect(secondConversations).toHaveLength(1);
		expect(thirdConversations).toHaveLength(1);

		expect(firstConversations[0].participants).toHaveLength(3);
		expect(secondConversations[0].participants).toHaveLength(3);
		expect(thirdConversations[0].participants).toHaveLength(3);
	});
});
