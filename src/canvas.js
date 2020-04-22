import React, { useState, useEffect } from 'react';
import { v4 } from 'uuid';
import Pusher from 'pusher-js';
import io from 'socket.io-client';

const userStrokeStyle = '#EE92C2';
const guestStrokeStyle = '#F0C987';
const userId = v4();
const line = [];
const socket = io('http://localhost:4000');

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default function DrawingCanvas() {
  const [isPainting, setIsPainting] = useState(false);
  const [prevPos, setPrevPos] = useState({offsetX: 0, offsetY: 0});
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  
  useEffect(() => {
    const canvas = document.querySelector('#drawingCanvas');
    canvas.width = windowDimensions.width;
    canvas.height = windowDimensions.height;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;

    socket.on('draw', (data) => {
      const { userId: id, line } = data;
      if (id !== userId) {
        line.forEach((position) => {
          paint(position.start, position.stop, guestStrokeStyle);
        });
      }
    });

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      socket.emit('draw', { line, userId });
      line.splice(0, line.length);
    }
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
