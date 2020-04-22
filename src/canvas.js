import React, { useState, useEffect } from 'react';
import { v4 } from 'uuid';
import Pusher from 'pusher-js';
import util from 'util';

const pusher = new Pusher('a1de361e8a5975db6810', {
  cluster: 'us2',
});
const userStrokeStyle = '#EE92C2';
const guestStrokeStyle = '#F0C987';
const userId = v4();
const line = [];

export default function DrawingCanvas() {
  const [isPainting, setIsPainting] = useState(false);
  const [prevPos, setPrevPos] = useState({offsetX: 0, offsetY: 0});
  
  useEffect(() => {
    const canvas = document.querySelector('#drawingCanvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;

    const channel = pusher.subscribe('painting');
    channel.bind('draw', (data) => {
      const { userId: id, line } = data;
      if (id !== userId) {
        line.forEach((position) => {
          paint(position.start, position.stop, guestStrokeStyle);
        });
      }
    });
  }, []);

  function getOffsets(targetTouches) {
    const element = document.querySelector('#drawingCanvas');
    // console.log(util.inspect(element, {showHidden: false, depth: null}))
    const x = element.offsetLeft;
    const y = element.offsetTop;
    const offsetX = targetTouches[0].clientX - x;
    const offsetY = targetTouches[0].clientY - y;
    return { offsetX, offsetY };
  }

  function onTouchStart({ targetTouches }) {
    setPrevPos(getOffsets(targetTouches));
    setIsPainting(true);
  }

  function paint(prevPos, currPos, strokeStyle) {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    const ctx = document.querySelector('#drawingCanvas').getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.moveTo(x, y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    setPrevPos({ offsetX, offsetY });
  }

  function onTouchMove({ targetTouches }) {
    if (isPainting) {
      const { offsetX, offsetY } = getOffsets(targetTouches);
      const offSetData = { offsetX, offsetY };
      const position = {
        start: { ...prevPos },
        stop: { ...offSetData },
      };
      line.push.apply(position);
      paint(prevPos, offSetData, userStrokeStyle);
    }
  }

  function endPaintEvent() {
    if (isPainting) {
      setIsPainting(false);
      // sendPaintData();
    }
  }

  async function sendPaintData() {
    const body = {
      line,
      userId
    };

    const req = await fetch('http://tabula-srv.herokuapp.com/paint', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    });
    const res = await req.json();
    console.log(res);
    line.splice(0, line.length);
  }

  return (
    <canvas
      id="drawingCanvas"
      style={{ background: 'black' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={endPaintEvent}
    />
  );
}
