import { Injectable, Logger } from '@nestjs/common';
import { saalplanMap } from 'src/helpers/saalplanMap';
import { TemperatureMap } from 'src/helpers/temperatureMap';
import { CANVAS_FILE, TARGET_FILE } from 'src/helpers/Constants';
import { SeatData } from 'src/models/seat-data';
import Jimp from 'jimp';

@Injectable()
export class HeatmapService {
  private readonly logger = new Logger(HeatmapService.name);

  async createHeatmap(currentTemperatures: Map<String, SeatData>) {
    const temperaturePoints = [];

    this.logger.log(
      'Drawing the following temperatures: ' +
        JSON.stringify(currentTemperatures),
    );

    for (const [key, value] of Object.entries(currentTemperatures)) {
      const seatLocation = saalplanMap[key];
      const x = seatLocation.x;
      const y = seatLocation.y;
      const v = value.value;
      temperaturePoints.push({ x: x, y: y, value: v });
    }

    const temperatureMap = new TemperatureMap(1124, 1903);
    temperatureMap.setPoints(temperaturePoints);
    const colorData = temperatureMap.drawFull();

    const jimp = new Jimp(1903, 1124);

    for (let x = 0; x < 1903; x++) {
      console.log('X' + x);
      for (let y = 0; y < 1124; y++) {
        const color = colorData[x][y];
        jimp.setPixelColor(
          Jimp.rgbaToInt(
            color.red,
            color.green,
            color.blue,
            color.transparency,
          ),
          x,
          y,
        );
      }
    }

    const bestuhlungsplan = await Jimp.read(CANVAS_FILE);
    await bestuhlungsplan.composite(jimp, 0, 0);
    await bestuhlungsplan.writeAsync(TARGET_FILE);
  }
}
