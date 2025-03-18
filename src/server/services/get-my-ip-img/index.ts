import { Router } from 'express';
import requestIp from 'request-ip';
import { imageWithText, imageWithIpLocationMap } from './image-creation';

export const router = Router();

router.use(requestIp.mw());

router.get('/', async (req, res) => {
  const image = imageWithText(req.clientIp || 'ip not resolved', 400, 100);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-Disposition', 'attachment;filename=my-ip.png');
  res.status(200).send(await image.getBuffer('image/png'));
});

router.get('/onmap', async (req, res) => {
  const image = await imageWithIpLocationMap(req.clientIp);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-Disposition', 'attachment;filename=my-location.png');
  res.status(200).send(await image.getBuffer('image/png'));
});
