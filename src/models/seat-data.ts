import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SeatData {
  @Field()
  seat: string;

  @Field((type) => Float)
  value: number;

  @Field((type) => String)
  timestamp: Date;
}
