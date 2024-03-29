import { Inject } from '@nestjs/common';
import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { SeatData } from 'src/models/seat-data';
import { InfluxService } from 'src/services/influx.service';

@Resolver((of) => SeatData)
export class SeatDataResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
    private readonly influxService: InfluxService,
  ) {}

  @Subscription((returns) => SeatData)
  seatDataChanged() {
    return this.pubSub.asyncIterator('seatDataChanged');
  }

  @Query((returns) => [SeatData])
  async currentTemperatureData() {
    const latestSeatData = await this.influxService.getLatestSeatData();
    return Object.values(latestSeatData);
  }
}
