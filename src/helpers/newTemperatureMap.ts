class Point {
  x: number;
  y: number;
  value: number;
}

class ColorData {
  red: number;
  green: number;
  blue: number;
  transparency: number;
}

export class TemperatureMap {
  private points: Point[];
  private readonly limits = {
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0,
  };

  private readonly minTemp = 22;
  private readonly maxTemp = 32;

  constructor(
    private readonly height: number,
    private readonly width: number,
  ) {}

  setPoints(points: Point[]) {
    this.points = points;
    this.setConvexhullPolygon();
  }

  drawFull(): ColorData[][] {
    const data: ColorData[][] = new Array(this.width);
    for (let x = 0; x < this.width; x++) {
      data[x] = new Array(this.height);
      for (let y = 0; y < this.height; y++) {
        const pointValue = this.getPointValue(x, y);
        if (pointValue !== -255) {
          const color = this.getColor(pointValue);
          data[x][y] = new ColorData();
          data[x][y].red = color.red;
          data[x][y].green = color.green;
          data[x][y].blue = color.blue;
          data[x][y].transparency = 128;
        }
      }
    }

    return data;
  }

  private getPointValue(x: number, y: number): number {
    const collection: { distance: number; index: number }[] = new Array(
      this.points.length,
    );
    for (let i = 0; i < this.points.length; i++) {
      const squareDistance = this.squareDistance(x, y, this.points[i]);
      if (squareDistance === 0) {
        return this.points[i].value;
      }
      collection[i] = { distance: squareDistance, index: i };
    }

    collection.sort((a, b) => a.distance - b.distance);

    let b = 0;
    let t = 0;
    for (let i = 0; i < this.points.length; i++) {
      const ptr = collection[i];
      const inv = 1 / Math.pow(ptr.distance, 2);
      t = t + inv * this.points[ptr.index].value;
      b = b + inv;
    }

    return t / b;
  }

  private setConvexhullPolygon() {
    let lower: Point[] = [];
    let upper: Point[] = [];
    let i = 0;

    this.limits.yMin = 0;
    this.limits.yMax = this.height;
    this.limits.xMin = 0;
    this.limits.xMax = this.width;

    this.points.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

    // Get convex hull polygon from points sorted by 'x'
    for (i = 0; i < this.points.length; i++) {
      while (
        lower.length >= 2 &&
        this.crossProduct(
          lower[lower.length - 2],
          lower[lower.length - 1],
          this.points[i],
        ) <= 0
      ) {
        lower.pop();
      }
      lower.push(this.points[i]);
    }

    for (i = this.points.length - 1; i >= 0; i--) {
      while (
        upper.length >= 2 &&
        this.crossProduct(
          upper[upper.length - 2],
          upper[upper.length - 1],
          this.points[i],
        ) <= 0
      ) {
        upper.pop();
      }
      upper.push(this.points[i]);
    }
  }

  private crossProduct(o: Point, a: Point, b: Point): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  private squareDistance(x: number, y: number, point: Point): number {
    const distanceX = x - point.x;
    const distanceY = y - point.y;

    return distanceX * distanceX + distanceY * distanceY;
  }

  private getColor(pointValue: number): ColorData {
    const limit = 0.55;
    const diff = this.maxTemp - this.minTemp;
    var value = pointValue;

    if (value < this.minTemp) {
      value = this.minTemp;
    }
    if (value > this.maxTemp) {
      value = this.maxTemp;
    }

    const tmp = 1 - (1 - limit) - ((value - this.minTemp) * limit) / diff;

    const red = this.hue2rgb(tmp + 0.33);
    const green = this.hue2rgb(tmp);
    const blue = this.hue2rgb(tmp - 0.33);
    const colorData = new ColorData();
    colorData.red = (red * 255) | 0;
    colorData.green = (green * 255) | 0;
    colorData.blue = (blue * 255) | 0;
    if (colorData.red > 255) colorData.red = 255;
    if (colorData.green > 255) colorData.green = 255;
    if (colorData.blue > 255) colorData.blue = 255;
    return colorData;
  }

  private hue2rgb(hue: number): number {
    const saturation = 1;
    const lightness = 0.5;

    const q = lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;

    if (hue < 0) {
      hue += 1;
    } else if (hue > 1) {
      hue -= 1;
    }

    if (hue >= 0.66) {
      return p;
    } else if (hue >= 0.5) {
      return p + (q - p) * (0.66 - hue) * 6;
    } else if (hue >= 0.33) {
      return q;
    } else {
      return p + (q - p) * 6 * hue;
    }
  }
}
