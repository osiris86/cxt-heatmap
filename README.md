# CXT Heatmap

Der geneigte Besucher der [Convention-X-Treme](https://convention-x-treme) LAN-Party in Karlsdorf-Neuthard weiß, dass es vor Ort gerne mal heiß her geht.

<p align="center">
<img src="img/fine.jpg" alt="Besucher der Convention-X-Treme" width="50%" />
</p>

Um zu analysieren wie sich die Temperaturen über das LAN-Party-Wochenende entwickeln, wurde dieses Projekt geboren. Es besteht insgesamt aus drei Repositories:

- cxt-heatmap (dieses Repository)
- [cxt-heatmap-fe](https://github.com/osiris86/cxt-heatmap-fe)
- [cxt-heatmap-sensor](https://github.com/osiris86/cxt-heatmap-sensor)

## CXT Heatmap Backend

Das Backend ist eine auf [NestJS](https://nestjs.com/) basierende Implementierung. Es stellt vier unterschiedliche Endpunkte zur Verfügung:

1. / - Unter root wird das Frontend bereitgestellt, welches im [cxt-heatmap-fe](https://github.com/osiris86/cxt-heatmap-fe) Repository liegt.
2. /png - Hier gibt das Backend eine PNG Datei mit der aktuellen Heatmap zurück.
3. /metrics - Hier gibt der Server Prometheus Informationen zurück
4. /graphql - Um die Daten für das Frontend bereitszustellen, gibt es auch einen GraphQL Endpunkt, der auch Subscriptions erlaubt. Diese ermöglicht eine dynamische Aktualisierung des Frontends, sobald neue Daten vorliegen

### Funktionsweise

#### MQTT

Die Sensoren senden ihre Daten per MQTT. Das Backend abonniert das entsprechende MQTT-Topic (cxt/temperature). Wenn neue Daten ankommen, werden diese zusammen mit dem Zeitstempel in eine Influx-Datenbank geschrieben, so dass auch die historischen Daten im Nachgang zur Verfügung stehen. Die Sensoren übertragen dabei die eigene ID sowie die gemessene Temperatur. Die ID wird über eine Konfigurationsdatei (idMap.json) einem Sitzplatz zugeordnet.

#### /png

Der Worker holt sich alle 30 Sekunden für jeden Sitzplatz die zuletzt gemessenen Temperaturen und überträgt diese auf die Karte. Dabei wurde die (temperatureMap)[https://github.com/optimisme/javascript-temperatureMap] Implementierung verwendet und geringfürig angepasst. Die Anpassungen beinhalten:

- Farben zum Temperaturbereich
- Farbbereich wird bis zum Bildrand gemalt

Die fertig erstellte Karte wird als png-Datei im Dateisystem abgelegt und der /png-Endpunkt spielt diese aus. Der Endpunkt ist bspw. für einen Discord-Bot gedacht, der ggf. vom CXT-Team noch entwickelt wird.

#### /metrics

Für jeden Platz, welcher in der Konfigurationsdatei (idMap.json) konfiguriert ist, erstellt der Prometheus-Service eine Metric. Unter dem o.g. Endpunkt stellt das Backend dann einen Prometheus-Endpunkt bereit, mit den zuletzt gemessenen Daten an den jeweiligen Plätzen.

#### /graphql

Mittels Apollo wird ein GraphQL Endpunkt bereitgestellt, der zum Einen über ein Query die Abfrage der aktuell gemessenen Temperaturen erlaubt und zum Anderen eine Subscription-Abfrage zur Verfügung stellt, die den Client über Temperaturveränderungen an den Plätzen informiert. Dieser Entpunkt wird vom [Frontend](https://github.com/osiris86/cxt-heatmap-fe) verwendet.

#### Discord Bot

Das Backend beinhaltet auch einen Discord-Bot, welcher eine DM versendet, sobald ein Sensor seit mehr als 15 Minuten keine Daten mehr gesendet hat. Sobald der Sensor wieder Daten sendet, wird ebenfalls eine Information per Discord-DM versendet.
