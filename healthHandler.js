export class HealthHandler {
  influxService

  constructor(influxService) {
    this.influxService = influxService
  }

  async generateHealthData() {
    const seatData = await this.influxService.getLatestSeatData()
    var html =
      '<html><body><table><tr><th>Seat</th><th>Temperature</th><th>Last Update</th></tr>'
    for (const [key, value] of Object.entries(seatData)) {
      html += '<tr>'
      html += '<td>' + key + '</td>'
      html += '<td>' + value.value + '</td>'
      html += '<td>' + value.timestamp + '</td>'
      html += '</tr>'
    }
    html += '</table></body></html>'
    return html
  }
}
