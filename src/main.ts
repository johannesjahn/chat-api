import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
	console.log(`Starting Chat API v${process.env.npm_package_version}`);

	const app = await NestFactory.create(AppModule, {
		cors: { origin: '*' },
		logger: ['error', 'warn', 'log'],
	});

	app.setGlobalPrefix('/app');

	app.use((req: Request, res: Response, next: NextFunction) => {
		res.removeHeader('X-Powered-By');
		next();
	});

	const config = new DocumentBuilder()
		.setTitle('Chat - API')
		.setDescription(
			`The Chat API, accessible at https://chat.johannes-jahn.com, offers a platform for real-time messaging. It supports secure user authentication and is designed for easy integration into applications requiring chat functionalities.`,
		)
		.setVersion(process.env.npm_package_version ?? '0.0.0')
		.addServer('https://chat.johannes-jahn.com')
		.addServer('https://nacho.johannes-jahn.com')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(3000);
}
bootstrap();
