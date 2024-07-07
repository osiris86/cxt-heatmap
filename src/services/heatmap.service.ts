import { Injectable, Logger } from '@nestjs/common';
import { saalplanMap } from 'src/helpers/saalplanMap';
import { TemperatureMap } from 'src/helpers/newTemperatureMap';
import { TemperatureMap as OldTemperatureMap } from 'src/helpers/TemperatureMap';
import { CANVAS_FILE, TARGET_FILE } from 'src/helpers/Constants';
import fs, { copyFileSync, createWriteStream, readFileSync, rmSync } from 'fs';
import { SeatData } from 'src/models/seat-data';
import Jimp from 'jimp';
import { createCanvas } from 'canvas';

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

    const canvas = createCanvas(1903, 1124);
    const ctx = canvas.getContext('2d');
    const drw = new OldTemperatureMap(ctx);
    drw.setPoints(temperaturePoints, 1903, 1124);
    drw.drawFull();

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

    await jimp.writeAsync(TARGET_FILE);

    /*drw.drawPoints(async () => {
          const img2 = new Image();
          img2.onload = () => {
            const combinedCanvas = createCanvas(1903, 1124);
            const combinedCtx = combinedCanvas.getContext('2d');
            combinedCtx.drawImage(img as unknown as Canvas, 0, 0);
            combinedCtx.drawImage(img2 as unknown as Canvas, 0, 0);

            const out = createWriteStream('./temp.png');
            const stream = combinedCanvas.createPNGStream();
            stream.pipe(out);
            out.on('finish', () => {
              copyFileSync('./temp.png', TARGET_FILE);
              rmSync('./temp.png');
            });
          };
          img2.src = canvas.toDataURL();
        });*/
  }
}
