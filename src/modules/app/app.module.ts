import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrometheusService } from '../../services/prometheus.service';
import { InfluxService } from '../../services/influx.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '../../services/config.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { SeatDataResolver } from './seatData.resolver';
import { PubSub } from 'graphql-subscriptions';
import { MqttController } from '../mqtt/mqtt.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      installSubscriptionHandlers: true,
    }),
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
  ],
})
export class AppModule {}
