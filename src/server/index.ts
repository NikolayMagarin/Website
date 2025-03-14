import express from 'express';
import path from 'path';
import { logger } from './lib/logger';
import { selfPingHandler, useSelfPingSecret } from './lib/self-ping';
import { enableServices } from './services';

const app = express();

app.post('/api/self-ping', express.json(), useSelfPingSecret, selfPingHandler);
app.post('/api/log', express.json(), logger.handler);

enableServices(app);

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
