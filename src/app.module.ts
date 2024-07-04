import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { AppLoggerMiddleware } from './middleware/app.logger.middleware';
import { PostModule } from './post/post.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './app.gateway';
import { testOrmOptions } from './utils.test';

@Module({
	imports: [
		ConfigModule.forRoot({ envFilePath: `${process.env.ENV_PATH ?? '.env'}` }),
		TypeOrmModule.forRoot(
			process.env.NODE_ENV === 'test'
				? testOrmOptions
				: {
						type: 'postgres',
						host: `${process.env.DATABASE_URL}`,
						port: 5432,
						username: 'chat',
						password: process.env.DATABASE_PW,
						database: 'chat',
						entities: [__dirname + '/**/*.entity{.ts,.js}'],
						synchronize: true,
					},
		),
		UsersModule,
		AuthModule,
		ChatModule,
		PostModule,
	],
	controllers: [AppController],
	providers: [AppService, AppGateway],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(AppLoggerMiddleware).forRoutes('*');
	}
}
