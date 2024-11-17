import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrapApp() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_URL,
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
    },
  });
  app.startAllMicroservices();
  app.enableCors();
  await app.listen(3000);
}

bootstrapApp();
