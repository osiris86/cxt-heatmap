import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MqttModule } from './mqtt.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.listen(3000);
  const mqtt = await NestFactory.createMicroservice<MicroserviceOptions>(
    MqttModule,
    {
      transport: Transport.MQTT,
      options: {
        url: process.env.MQTT_URL,
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASSWORD,
      },
    },
  );
  await mqtt.listen();
}
bootstrap();
