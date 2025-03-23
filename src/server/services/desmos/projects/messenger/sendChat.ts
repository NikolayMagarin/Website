import { RequestHandler } from 'express';
import { storage } from './storage';

export const sendChat: RequestHandler = (req, res) => {
  res.status(200).type('image/svg+xml').send(getCurrentSVG());
};

function getCurrentSVG() {
  const msgs = storage.global.chat.messages;
  const svg = `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .chat {
          font: 12px Consolas;
          padding: 10px;
          position: absolute;
          bottom: 0px;
          width: 100%;
        }
        .background {
            position: fixed;
            top:0;
            left:0;
            bottom:0;
            right:0;
            background: black;
            border-radius: 10px;
        }
        .message {
            display: flex;
            flex-direction: row;
        }
        .user {
            color: gold;
        }
        .text {
            color: lightblue;
        }
        .delim {
            padding: 0 2px;
            color: silver;
        }
      </style>
      <foreignObject width="100%" height="100%" >
        <div class="background" xmlns="http://www.w3.org/1999/xhtml"></div>
        <div class="chat" xmlns="http://www.w3.org/1999/xhtml">
          ${msgs
            .map(
              ({ userName, text }, i) =>
                `<div class="message"><div class="user">${userName}</div><span class="delim">:</span><div class="text">${text}</div></div>`
            )
            .join('')}
        </div>
      </foreignObject>
    </svg>
  `;
  return svg;
}
