import { Injectable, Logger } from '@nestjs/common';
import { saalplanMap } from 'src/helpers/saalplanMap';
import { Canvas, createCanvas, Image } from 'canvas';
import { TemperatureMap } from 'src/helpers/temperatureMap';
import { CANVAS_FILE, TARGET_FILE } from 'src/helpers/Constants';
import fs, { copyFileSync, createWriteStream, readFileSync, rmSync } from 'fs';
import { SeatData } from 'src/models/seat-data';

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

    const canvas = createCanvas(1903, 1124);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const drw = new TemperatureMap(ctx);
    img.onload = () => {
      drw.setPoints(temperaturePoints, 1903, 1124);
      drw.drawFull(false, () => {
        drw.drawPoints(async () => {
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
        });
      });
    };
    img.src = readFileSync(CANVAS_FILE);
  }
}
