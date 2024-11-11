import express from 'express';
import path from 'path';
import { logger } from './lib/logger';
import { selfPingHandler, useSelfPingSecret } from './lib/self-ping';

const app = express();

app.post('/api/self-ping', express.json(), useSelfPingSecret, selfPingHandler);
app.post('/api/log', express.json(), logger.handler);

const jsPath = path.join(__dirname, '../..', 'out/client');
app.use(
  '/static/js',
  express.static(jsPath, {
    extensions: ['js'],
  })
);

const publicPath = path.join(__dirname, '../..', 'public');
app.use('/static', express.static(publicPath));

app.use('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(8080);

// (async () => {
//   await db.collection('rickrolled').add({ timestamp: new Date() });
// })();
