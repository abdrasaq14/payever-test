import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { UserModel } from './users.model';
import { MailModule } from 'src/mail/mail.module';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserModel', schema: UserModel.schema },
    ]),
    MailModule, 
    RabbitMQModule,
  ],
  providers: [UserService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UsersModule {}
