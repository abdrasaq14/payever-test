import { ConfigService } from '@nestjs/config';

export interface Config {
  databaseUrl: string;
  port: number;
  EMAIL_USER: string;
    EMAIL_PASS: string;
    RABBITMQ_URL: string;
}

const getConfig = (configService: ConfigService): Config => {
  return {
    databaseUrl: configService.get<string>('MONGODB_URL'),
    port: configService.get<number>('PORT'),
    EMAIL_USER: configService.get<string>('EMAIL_USER'),
    EMAIL_PASS: configService.get<string>('EMAIL_PASS'),
    RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
  };
};

export default getConfig;
