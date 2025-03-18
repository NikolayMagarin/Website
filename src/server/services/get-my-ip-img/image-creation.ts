import {
  intToRGBA,
  Jimp,
  loadFont,
  measureText,
  measureTextHeight,
} from 'jimp';
import path from 'path';
import { getMapTilesFromIp } from './getMapTiles';

const fontPath = path.resolve(
  require.resolve('@jimp/plugin-print'),
  '../../fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt'
);

let font: any = null;
loadFont(fontPath).then((loadedFont: any) => {
  font = loadedFont;
  onFontLoadedCallbacks.forEach((cb) => cb());
});

let onFontLoadedCallbacks: (() => void)[] = [];
export function onFontLoaded(cb: () => void) {
  if (font) {
    cb();
  } else {
    onFontLoadedCallbacks.push(cb);
  }
}

export const MAX_TEXT_WIDTH = 2048;

export function imageWithText(
  text: string,
  imageWidth: number = 0,
  imageHeight: number = 0
) {
  const width = measureText(font, text);
  const height = measureTextHeight(font, text, imageWidth || MAX_TEXT_WIDTH);
  const image = new Jimp({
    width: imageWidth || width,
    height: imageHeight || height,
    color: 0xffffffff,
  });

  image.print({
    text,
    x: (image.width - width) / 2,
    y: (image.height - height) / 2,
    maxWidth: image.width,
    font,
  });

  return image;
}

export async function imageWithIpLocationMap(ip: string | undefined) {
  const { tiles, dx, dy } = await getMapTilesFromIp(ip);

  if (tiles) {
    const images = await Promise.all(tiles.map((tile) => Jimp.read(tile)));

    const w = images[0].width;
    const h = images[0].height;
    const w2 = w * 2;
    const h2 = h * 2;

    const resultImage = new Jimp({
      width: w * 3,
      height: h * 3,
      color: 0xffffffff,
    });

    images[0].scan((x, y) => {
      resultImage.setPixelColor(images[0].getPixelColor(x, y), x, y);
      resultImage.setPixelColor(images[1].getPixelColor(x, y), x, y + h);
      resultImage.setPixelColor(images[2].getPixelColor(x, y), x, y + h2);
      resultImage.setPixelColor(images[3].getPixelColor(x, y), x + w, y);
      resultImage.setPixelColor(images[4].getPixelColor(x, y), x + w, y + h);
      resultImage.setPixelColor(images[5].getPixelColor(x, y), x + w, y + h2);
      resultImage.setPixelColor(images[6].getPixelColor(x, y), x + w2, y);
      resultImage.setPixelColor(images[7].getPixelColor(x, y), x + w2, y + h);
      resultImage.setPixelColor(images[8].getPixelColor(x, y), x + w2, y + h2);
    });

    const markerImage = await Jimp.read('public/assets/marker-red.png');

    const pointX = (dx + 1) * w - markerImage.width / 2;
    const pointY = (dy + 1) * h - markerImage.height;

    markerImage.scan((x, y) => {
      const c = markerImage.getPixelColor(x, y);
      if (intToRGBA(c).a) {
        resultImage.setPixelColor(c, x + pointX, y + pointY);
      }
    });

    return resultImage;
  } else {
    return imageWithText(ip || 'ip not resolved', 400, 100);
  }
}
