import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import getConfig from './config/config';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: getConfig(configService).databaseUrl,
      }),
    }),
    UsersModule
  ],
  
})
export class AppModule {
  constructor(private configService: ConfigService) {
    const config = getConfig(configService);
     console.log('Database connected');
     console.log('Port:', config.port);
  }
}
