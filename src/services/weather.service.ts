import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getTemperatureData() {
    const url =
      'https://api.netatmo.com/api/getpublicdata?lat_ne=49.13139&lon_ne=8.5341481&lat_sw=49.130148&lon_sw=8.5287784&required_data=temperature&filter=false';
    const accessToken = await this.configService.get('NETATMO_ACCESS_TOKEN');
    const response = await lastValueFrom(
      await this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    const bodyData = response.data.body[0];
    const data = bodyData.measures['02:00:00:9b:57:76'].res;
    const types = bodyData.measures['02:00:00:9b:57:76'].type;
    const indexTemp = types.indexOf('temperature');
    const indexHumidity = types.indexOf('humidity');
    const keys = Object.keys(data);
    const key = keys[0];
    const temperature = data[key][indexTemp];
    const humidity = data[key][indexHumidity];
    const finalData = {
      temperature,
      humidity,
    };
    return finalData;
  }
}
