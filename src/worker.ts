import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './modules/worker/worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  await app.listen(3001);
}
bootstrap();
