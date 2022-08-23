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
import { AwsService } from './aws/aws.service';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.ENV_PATH}` }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: `${process.env.DATABASE_URL}`,
      port: 5432,
      username: 'chat',
      password: process.env.DATABASE_PW,
      database: 'chat',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ChatModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService, AwsService, AppGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
