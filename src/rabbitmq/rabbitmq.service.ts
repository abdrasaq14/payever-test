import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import getConfig from '../config/config'

@Injectable()
export class RabbitMQService {
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    const { RABBITMQ_URL } = getConfig(configService);
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue: 'user_events',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async emitUserCreatedEvent(user: any): Promise<void> {
    this.client.emit('user_created', user);
    console.log('User created event emitted');
  }
}
