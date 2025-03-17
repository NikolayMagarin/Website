import { Router } from 'express';
import requestIp from 'request-ip';
import {
  Jimp,
  loadFont,
  measureText,
  measureTextHeight,
  intToRGBA,
} from 'jimp';
import path from 'path';
import { getLocation } from './getLocation';
import { calcTileXY } from './calcTileXY';
import { logger } from '../../lib/logger';
import { getTile, GetTileResult } from './getTile';

const fontPath = path.resolve(
  require.resolve('@jimp/plugin-print'),
  '../../fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt'
);

export const router = Router();

router.use(requestIp.mw());

router.get('/', async (req, res) => {
  const image = await printImageWithIp(req.clientIp);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-Disposition', 'attachment;filename=my-ip.png');
  res.status(200).send(await image.getBuffer('image/png'));
});

router.get('/onmap', async (req, res) => {
  const image = await printImageWithIpLocationMap(req.clientIp);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-Disposition', 'attachment;filename=my-location.png');
  res.status(200).send(await image.getBuffer('image/png'));
});

async function printImageWithIp(ip: string | undefined) {
  const image = new Jimp({ width: 400, height: 100, color: 0xffffffff });

  const font = await loadFont(fontPath);
  const text = ip?.toString() || 'ip not resolved';
  const width = measureText(font, text);
  const height = measureTextHeight(font, text, image.width);

  image.print({
    text,
    x: (image.width - width) / 2,
    y: (image.height - height) / 2,
    maxWidth: image.width,
    font,
  });

  return image;
}

async function printImageWithIpLocationMap(ip: string | undefined) {
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
    return printImageWithIp(ip);
  }
}

async function getMapTilesFromIp(ip: string | undefined) {
  if (ip) {
    const location = await getLocation(ip);
    if (location.success) {
      const zoom = 11;
      const { tileX, tileY, dx, dy } = calcTileXY(
        location.lat,
        location.lon,
        zoom
      );

      const promises: Promise<GetTileResult>[] = [];
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          promises.push(getTile(tileX + x, tileY + y, zoom));
        }
      }
      let errors: any[] = [];
      const tiles = (await Promise.all(promises)).map((result) => {
        if (result.success) {
          return result.image;
        } else {
          errors.push(result.error);
        }
      }) as ArrayBuffer[];

      if (!errors.length) {
        return { tiles, dx, dy };
      } else {
        errors.forEach((error) => {
          logger.log('ERR-get-location-tile', error.toString(), {
            tileX,
            tileY,
            zoom,
          });
        });
      }
    } else {
      logger.log('ERR-get-ip-location', location.error.toString(), {
        location: location,
      });
    }
  }

  return { tiles: null };
}
