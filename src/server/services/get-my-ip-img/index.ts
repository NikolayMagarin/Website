import { Router } from 'express';
import requestIp from 'request-ip';
import { Jimp, loadFont, measureText, measureTextHeight } from 'jimp';
import path from 'path';

const fontPath = path.resolve(
  require.resolve('@jimp/plugin-print'),
  '../../fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt'
);

export const router = Router();

router.use(requestIp.mw());

router.get('/', async (req, res) => {
  const image = new Jimp({ width: 400, height: 100, color: 0xffffffff });

  const font = await loadFont(fontPath);
  const text = req.clientIp?.toString() || 'ip not resolved';
  const width = measureText(font, text);
  const height = measureTextHeight(font, text, image.width);

  image.print({
    text,
    x: (image.width - width) / 2,
    y: (image.height - height) / 2,
    maxWidth: image.width,
    font,
  });

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-Disposition', 'attachment;filename=my-ip.png');
  res.status(200).send(await image.getBuffer('image/png'));
});
