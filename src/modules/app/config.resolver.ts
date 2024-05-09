import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from './auth.guard';
import { ConfigElement } from 'src/models/config-element';
import { ConfigService } from 'src/services/config.service';

@Resolver()
export class ConfigResolver {
  constructor(private readonly configService: ConfigService) {}

  @UseGuards(AuthGuard)
  @Query(() => [ConfigElement])
  async currentConfig(): Promise<ConfigElement[]> {
    const currentConfig = this.configService.getCurrentConfig();
    return this.convertToConfigElements(currentConfig);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => [ConfigElement])
  async addConfigElement(
    @Args('seat') seat: string,
    @Args('id') id: string,
  ): Promise<ConfigElement[]> {
    const currentConfig = this.configService.getCurrentConfig();
    currentConfig[id] = seat;
    this.configService.saveConfig(currentConfig);

    return this.convertToConfigElements(currentConfig);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => [ConfigElement])
  async removeConfigElement(@Args('id') id: string): Promise<ConfigElement[]> {
    const currentConfig = this.configService.getCurrentConfig();
    delete currentConfig[id];
    this.configService.saveConfig(currentConfig);

    return this.convertToConfigElements(currentConfig);
  }

  private convertToConfigElements(config: any): ConfigElement[] {
    return Object.entries(config).map(([id, seat]) => {
      return {
        id,
        seat: seat as string,
      };
    });
  }

  private convertToConfigObject(configElements: ConfigElement[]): any {
    return configElements.reduce((acc, { id, seat }) => {
      acc[id] = seat;
      return acc;
    }, {});
  }
}
