import { RequestHandler } from 'express';
import { storage } from './storage';

export const refreshOnMessage: RequestHandler = (req, res) => {
  if (req.desmos.pageLoad) {
    const currentMessagesCount = storage.global.chat.messages.length;

    const interval = setInterval(() => {
      if (storage.global.chat.messages.length > currentMessagesCount) {
        clearInterval(interval);
        res.status(200).type('image/svg+xml').send(REFRESH_TO_VIEW_SVG);
      }
    }, 1000);
  } else {
    res.status(200).type('image/svg+xml').send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
        <rect x="0" y="0" width="10" height="10"/>
      </svg>
    `);
  }
};

const REFRESH_TO_VIEW_SVG = `
<svg viewBox="0 0 165 50" xmlns="http://www.w3.org/2000/svg">
  <style>
    .notification {
        font: 12px Consolas;
        padding: 10px;
        position: absolute;
        bottom: 0px;
        width: 100%;
        color: black;
    }
  .background {
        position: fixed;
        top:0;
        left:0;
        bottom:0;
        right:0;
        background: lightgrey;
        border-radius: 10px;
    }
  </style>
  <foreignObject width="100%" height="100%">
    <div class="background" xmlns="http://www.w3.org/1999/xhtml"/>
    <div class="notification" xmlns="http://www.w3.org/1999/xhtml">
      New message!<br/><span style="font-size: 8px">(Refresh the page to view)</span>
    </div>
  </foreignObject>
</svg>`;
