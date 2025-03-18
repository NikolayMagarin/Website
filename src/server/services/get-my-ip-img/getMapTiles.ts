import { logger } from '../../lib/logger';
import { calcTileXY } from './calcTileXY';
import { getLocation } from './getLocation';
import { getTile, GetTileResult } from './getTile';

export async function getMapTilesFromIp(ip: string | undefined) {
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
