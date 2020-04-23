import React, { useState, useEffect, useRef, useContext } from 'react';
import CanvasContext from "./context/canvas";
import SocketContext from "./context/socket";
import PhoneContext from './context/phone';
import ModeIcon from './ModeIcon';

import { v4 } from 'uuid';
const userId = v4();
const line = [];

const canvasRef = React.createRef();

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
}

export default function DrawingCanvas() {
  const isDragModeRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isPaintingRef = useRef(false);
  const prevPosRef = useRef({ offsetX: 0, offsetY: 0 });

  const { phoneBoundsRef } = useContext(PhoneContext);
  const { lineWidthRef, lineColorRef } = useContext(CanvasContext);
  const { socket } = useContext(SocketContext);

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    window.addEventListener('touchstart', ({targetTouches}) => {
      if (isDragModeRef.current) {
        isDraggingRef.current = true;
        const offsetX = targetTouches[0].clientX;
        const offsetY = targetTouches[0].clientY;
        prevPosRef.current = { offsetX, offsetY };
      }
    });

    window.addEventListener('touchmove', ({targetTouches}) => {
      if (isDraggingRef.current) {
        const curX = targetTouches[0].clientX;
        const curY = targetTouches[0].clientY;
        const { offsetX: prevX, offsetY: prevY } = prevPosRef.current;
        const { x: boundX, y: boundY } = phoneBoundsRef.current;

        const bounds = {
          width: window.innerWidth,
          height: window.innerHeight,
          x: Math.max(0, boundX - (curX - prevX)),
          y: Math.max(0, boundY - (curY - prevY))
        };

        setPhoneBounds(bounds);
        socket.emit('setPhoneBounds', bounds);

        prevPosRef.current = { offsetX: curX, offsetY: curY }
      }
    });

    window.addEventListener('touchend', () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
      }
    });

  });

  function setPhoneBounds(bounds) {
    phoneBoundsRef.current = bounds;
    const {x, y} = bounds;
    canvasRef.current.style.left = `-${x}px`;
    canvasRef.current.style.top = `-${y}px`;
  }

  function loadImage(url) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = url;
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
    };
  }

  useEffect(() => {
    canvasRef.current.width = windowDimensions.width;
    canvasRef.current.height = windowDimensions.height;
  }, [windowDimensions]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;

    socket.on("paint", (data) => {
      const {userId: id, line} = data;
      if (id !== userId) {
        line.forEach((position) => {
          paint(position.start, position.stop);
        });
      }
    });

    socket.on("updateImage", (imageUrl) => {
      loadImage(imageUrl);
    });

    socket.on("setPhoneBounds", setPhoneBounds);
    socket.on("setCanvasBounds", (bounds) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = canvas.toDataURL();
      ctx.canvas.width = bounds.width;
      ctx.canvas.height = bounds.height;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = lineColorRef.current;
      ctx.lineWidth = lineWidthRef.current;
      loadImage(imageData);
    });

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

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
    if (!isDragModeRef.current) {
      isPaintingRef.current = true;
    }
  }

  function paint(prevPos, currPos) {
    console.log(prevPos, currPos);
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = lineColorRef.current;
    ctx.lineWidth = lineWidthRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    prevPosRef.current = { offsetX, offsetY };
  }

  function onTouchMove({ targetTouches }) {
    if (isPaintingRef.current) {
      const {offsetX, offsetY} = getOffsets(targetTouches);
      const offSetData = {offsetX, offsetY};
      const position = {
        start: {...prevPosRef.current},
        stop: {...offSetData},
      };
      line.push(position);
      paint(prevPosRef.current, offSetData);
    }
  }

  function onTouchEnd() {
    if (isPaintingRef.current) {
      isPaintingRef.current = false;
      const { x: boundX, y: boundY } = phoneBoundsRef.current;
      for (let l of line) {
        l.start.x += boundX;
        l.start.y += boundY;
        l.stop.x += boundX;
        l.stop.y += boundY;
      }
      socket.emit('paint', {line, userId});
      line.splice(0, line.length);
    }
  }

  return (
    <div style={{height: '100%', width: '100%', position: 'absolute', top: 0, right: 0, left: 0, bottom: 0}}>
      <canvas
        ref={canvasRef}
        id="drawingCanvas"
        style={{
          background: 'black',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
      <ModeIcon isDragModeRef={isDragModeRef} />
    </div>
  );

}
