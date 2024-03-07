import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { readFileSync, watch } from 'fs';
import { ID_MAP_FILE } from 'src/helpers/Constants';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private eventEmitter: EventEmitter2) {
    watch(ID_MAP_FILE, () => {
      this.fileChanged();
    });
    this.readConfigFile();
  }

  private fileChanged() {
    setTimeout(() => {
      this.readConfigFile();
    }, 1000);
  }

  private readConfigFile() {
    try {
      const contents = readFileSync(ID_MAP_FILE);
      const idMap = JSON.parse(contents.toString());

      this.eventEmitter.emit('idMap.changed', idMap);
    } catch (e) {
      this.logger.error(e);
      this.logger.log('Invalid config @ ' + ID_MAP_FILE);
    }
  }
}
