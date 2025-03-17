export function calcTileXY(lat: number, lon: number, zoom: number = 11) {
  const n = 2 ** zoom;

  const x = ((1 + degToRad(lon) / Math.PI) / 2) * n;
  const y = ((1 - Math.asinh(Math.tan(degToRad(lat))) / Math.PI) / 2) * n;

  const dx = x % 1;
  const dy = y % 1;

  const tileX = Math.floor(x);
  const tileY = Math.floor(y);

  return { tileX, tileY, dx, dy };
}

function degToRad(deg: number) {
  return deg * (Math.PI / 180.0);
}
