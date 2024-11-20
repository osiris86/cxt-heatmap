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
    const refreshToken = await this.configService.get('NETATMO_REFRESH_TOKEN');
    if (!refreshToken || refreshToken.length === 0) {
      console.log('No refresh token found');
      return null;
    }
    let accessToken = await this.configService.get('NETATMO_ACCESS_TOKEN');
    if (!accessToken || accessToken.length === 0) {
      await this.refreshAccessToken();
      accessToken = await this.configService.get('NETATMO_ACCESS_TOKEN');
    }
    const url =
      'https://api.netatmo.com/api/getpublicdata?lat_ne=49.13139&lon_ne=8.5341481&lat_sw=49.130148&lon_sw=8.5287784&required_data=temperature&filter=false';
    try {
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
    } catch (error) {
      await this.refreshAccessToken();
      return this.getTemperatureData();
    }
  }

  private async refreshAccessToken() {
    try {
      const url = 'https://api.netatmo.com/oauth2/token';
      const response = (
        await lastValueFrom(
          await this.httpService.post(
            url,
            {
              grant_type: 'refresh_token',
              refresh_token: await this.configService.get(
                'NETATMO_REFRESH_TOKEN',
              ),
              client_id: await this.configService.get('NETATMO_CLIENT_ID'),
              client_secret: await this.configService.get(
                'NETATMO_CLIENT_SECRET',
              ),
            },
            {
              headers: {
                'content-type':
                  'application/x-www-form-urlencoded;charset=UTF-8',
              },
            },
          ),
        )
      ).data;
      console.log(response);
      await this.configService.set(
        'NETATMO_ACCESS_TOKEN',
        response.access_token,
      );
      await this.configService.set(
        'NETATMO_REFRESH_TOKEN',
        response.refresh_token,
      );
    } catch (error) {
      console.log('error', error);
    }
  }
}
