import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

@Resolver()
export class AuthenticationResolver {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Mutation(() => String)
  async login(
    @Args({ name: 'password', type: () => String }) password: String,
  ) {
    const authPassword = this.configService.get('AUTH_PASSWORD');
    if (password !== authPassword) {
      throw new UnauthorizedException();
    }

    const payload = { sub: 'admin', username: 'admin' };
    return await this.jwtService.signAsync(payload);
  }
}
