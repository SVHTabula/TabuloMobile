import React, { useState, useEffect, useRef } from 'react';
import { v4 } from 'uuid';
import io from 'socket.io-client';

const socket = io.connect('https://tabula-web.herokuapp.com');
const userId = v4();
const line = [];
const canvasRef = React.createRef();

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
}

export default function DrawingCanvas() {
  const userStrokeStyleRef = useRef("#EE92C2");
  const isPaintingRef = useRef(false);
  const prevPosRef = useRef({ offsetX: 0, offsetY: 0 });

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  
  useEffect(() => {
    canvasRef.current.width = windowDimensions.width;
    canvasRef.current.height = windowDimensions.height;
  }, [windowDimensions]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    socket.on("draw", (data) => {
      const { userId: id, line } = data;
      if (id !== userId) {
        line.forEach((position) => {
          paint(position.start, position.stop, userStrokeStyleRef.current);
        });
      }
    });
    socket.on("newColor", (data) => {
      userStrokeStyleRef.current = data;
    })

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function getOffsets(targetTouches) {
    const canvas = canvasRef.current;
    const x = canvas.offsetLeft;
    const y = canvas.offsetTop;
    const offsetX = targetTouches[0].clientX - x;
    const offsetY = targetTouches[0].clientY - y;
    return { offsetX, offsetY };
  }

  function onTouchStart({ targetTouches }) {
    prevPosRef.current = getOffsets(targetTouches);
    isPaintingRef.current = true;
  }

  function paint(prevPos, currPos, strokeStyle) {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.moveTo(x, y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    prevPosRef.current = { offsetX, offsetY };
  }

  function onTouchMove({ targetTouches }) {
    if (isPaintingRef.current) {
      const { offsetX, offsetY } = getOffsets(targetTouches);
      const offSetData = { offsetX, offsetY };
      const position = {
        start: { ...prevPosRef.current },
        stop: { ...offSetData },
      };
      line.push(position);
      paint(prevPosRef.current, offSetData, userStrokeStyleRef.current);
    }
  }

  function endPaintEvent() {
    if (isPaintingRef.current) {
      isPaintingRef.current = false;
      console.log({line, userId});
      socket.emit('paint', { line, userId });
      line.splice(0, line.length);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      id="drawingCanvas"
      style={{ background: 'black' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={endPaintEvent}
    />
  );
}
