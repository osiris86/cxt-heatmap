import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MqttModule } from './modules/mqtt/mqtt.module';

async function bootstrapApp() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

async function bootstrapMqtt() {
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
bootstrapApp();
bootstrapMqtt();
