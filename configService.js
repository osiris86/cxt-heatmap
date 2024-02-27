import fs from 'fs'

const idMapFile = './idMap.json'

export class ConfigService {
  configFileChangedHandler

  constructor(configFileChangedHandler) {
    this.configFileChangedHandler = configFileChangedHandler

    fs.watch(idMapFile, (event, filename) => {
      this.fileChanged(event)
    })
    this.readConfigFile()
  }

  fileChanged(event) {
    setTimeout(this.readConfigFile.bind(this), 1000)
  }

  readConfigFile() {
    try {
      const contents = fs.readFileSync(idMapFile)
      console.log(contents.toString())
      const idMap = JSON.parse(contents)
      this.configFileChangedHandler(idMap)
    } catch (e) {
      console.error(e)
      console.log('Invalid config @ ' + idMapFile)
    }
  }
}
