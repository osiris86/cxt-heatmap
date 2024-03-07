import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SeatData {
  @Field()
  seat: string;

  @Field((type) => Int)
  value: number;

  @Field()
  timestamp: Date;
}
