import express from 'express';
import path from 'path';
import { Logger } from './lib/Logger';
import { selfPingHandler, useSelfPingSecret } from './lib/self-ping';
import { enableServices } from './services';

const app = express();

app.use(Logger.middleware());

enableServices(app);

app.post('/api/log', express.json(), (req, res) => {
  /* TODO: Log user analitics here */
  res.status(200).json({ ok: true });
});
app.post('/api/self-ping', express.json(), useSelfPingSecret, selfPingHandler);

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
