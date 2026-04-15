import * as request from 'supertest';
import { app } from './setup.e2e';

describe('AppController (e2e)', () => {
	it('/debug (GET)', async () => {
		const response = await request(app.getHttpServer())
			.get('/debug')
			.expect(200)
			.expect((res) => res.body === JSON.stringify({ message: 'Thanks for using the debug endpoint.' }));
		return response;
	});
});
