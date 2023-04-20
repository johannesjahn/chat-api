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
import { StatusMonitorModule } from 'nestjs-status-monitor';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.ENV_PATH ?? '.env'}` }),
    StatusMonitorModule.forRoot({
      title: 'Nacho Chat Status', // Default title
      path: '/status',
      socketPath: '/status-socket.io', // In case you use a custom path
      port: null, // Defaults to NestJS port
      spans: [
        {
          interval: 1, // Every second
          retention: 60, // Keep 60 datapoints in memory
        },
        {
          interval: 5, // Every 5 seconds
          retention: 60,
        },
        {
          interval: 15, // Every 15 seconds
          retention: 60,
        },
      ],
      chartVisibility: {
        cpu: true,
        mem: true,
        load: true,
        responseTime: true,
        rps: true,
        statusCodes: true,
      },
      ignoreStartsWith: ['/admin'], // paths to ignore for responseTime stats
      healthChecks: [
        {
          protocol: 'http',
          host: 'localhost',
          path: '/app/debug',
          port: 3000,
        },
      ],
    }),
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
