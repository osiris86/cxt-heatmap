import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { SeatData } from 'src/models/seat-data';

@Injectable()
export class DiscordService {
  private readonly client;
  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      intents: [GatewayIntentBits.DirectMessages],
    });
    this.login();
  }

  private async login() {
    await this.client.login(this.configService.get('DISCORD_TOKEN'));
    console.log('Logged in as', this.client.user.tag);
  }

  sendOfflineNotification(seat: String) {
    this.sendMessage(
      'Vom Platz ' +
        seat +
        ' wurde seit 15 Minuten keine Temperatur mehr empfangen.',
    );
  }

  sendOnlineNotification(seat: String) {
    this.sendMessage('Der Platz ' + seat + ' ist wieder online.');
  }

  async sendMessage(message: String) {
    const user = await this.client.users.fetch(
      this.configService.get('DISCORD_USER'),
    );
    const dm = await user.createDM();
    dm.send(message);
  }
}
