import client from 'prom-client';
import fs from 'fs';
import 'dotenv/config';

const idMapFile = './idMap.json';

export class PrometheusHandler {
  register = new client.Registry();

  metrics = {};

  influxService;

  constructor(influxService) {
    this.influxService = influxService;
  }
}
