import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from './auth.guard';

@Resolver()
export class ConfigResolver {
  @UseGuards(AuthGuard)
  @Query(() => String)
  async getCurrentConfig() {
    return 'Hello World';
  }
}
