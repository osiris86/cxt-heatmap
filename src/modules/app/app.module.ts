import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrometheusService } from '../../services/prometheus.service';
import { InfluxService } from '../../services/influx.service';
import {
  ConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '../../services/config.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SeatDataResolver } from './seatData.resolver';
import { PubSub } from 'graphql-subscriptions';
import { MqttController } from '../mqtt/mqtt.controller';
import { AuthenticationResolver } from './authentication.resolver';
import { JwtModule } from '@nestjs/jwt';
import { ConfigResolver } from './config.resolver';
import { DiscordService } from 'src/services/discord.service';
import { HttpModule } from '@nestjs/axios';
import { WeatherService } from 'src/services/weather.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'public'),
      exclude: ['/png', '/metrics', '/graphql'],
    }),
    JwtModule.registerAsync({
      useFactory: async (configService: NestConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '600s' },
      }),
      inject: [NestConfigService],
    }),
    HttpModule,
  ],
  controllers: [AppController, MqttController],
  providers: [
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
    PrometheusService,
    InfluxService,
    ConfigService,
    SeatDataResolver,
    AuthenticationResolver,
    ConfigResolver,
    DiscordService,
    WeatherService,
  ],
})
export class AppModule {}
