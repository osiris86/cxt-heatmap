import { Inject } from '@nestjs/common';
import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { SeatData } from 'src/models/seat-data';

@Resolver((of) => SeatData)
export class SeatDataResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: PubSub) {}
  @Subscription((returns) => SeatData)
  seatDataChanged() {
    return this.pubSub.asyncIterator('seatDataChanged');
  }

  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }
}
