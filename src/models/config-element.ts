import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConfigElement {
  @Field((type) => String)
  id: string;

  @Field((type) => String)
  seat: string;
}
