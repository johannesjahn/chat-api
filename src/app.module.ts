import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { AppLoggerMiddleware } from './middleware/app.logger.middleware';

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
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
