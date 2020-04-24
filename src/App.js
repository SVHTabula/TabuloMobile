import React, { useEffect, useRef } from 'react';
import { IonApp } from '@ionic/react';
import SocketContext from "./context/socket";
import CanvasContext from "./context/canvas";
import PhoneContext from "./context/phone";
import io from "socket.io-client";
import "./App.css";
import TheCurrentScreen from "./components/TheCurrentScreen";
import {canvasRef} from "./components/TheDrawingCanvas"

const socket = io("https://tabula-web.herokuapp.com");

export default function App() {
  const lineWidthRef = useRef(5);
  const lineColorRef = useRef("#ffffff");
  const phoneBoundsRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
    x: 0,
    y: 0
  });
  const canvasBoundsRef = useRef({
    width: 100,
    height: 100
  });

  const roomIdRef = useRef(null);

  function setPhoneBounds(bounds) {
    phoneBoundsRef.current = bounds;
    const {x, y} = bounds;
    canvasRef.current.style.left = `-${x}px`;
    canvasRef.current.style.top = `-${y}px`;
  }

  function moveScreen(direction) {
    switch (direction) {
      case "UP":
        phoneBoundsRef.current.y -= 1;
        break;
      case "DOWN":
        phoneBoundsRef.current.y += 1;
        break;
      case "LEFT":
        phoneBoundsRef.current.x -= 1;
        break;
      case "RIGHT":
        phoneBoundsRef.current.x += 1;
        break;
      default:
        console.log("error");
    }
  }

  function handleOrientation(event) {
    if (!roomIdRef.current) return;

    socket.emit("setPhoneBounds", phoneBoundsRef.current);
    setPhoneBounds(phoneBoundsRef.current);
    const beta = event.beta;
    const gamma = event.gamma;
    if (beta < 170 && beta > 0) moveScreen("LEFT");
    if (beta > -170 && beta < 0) moveScreen("RIGHT");
    if (gamma < -30) moveScreen('DOWN');
    if (gamma > 30) moveScreen('UP')
  }

  useEffect(() => {
    socket.on("setColor", (color) => {
      lineColorRef.current = color;
    });
    socket.on("setWidth", (width) => {
      lineWidthRef.current = width;
    });
    socket.on("setIsBlackboardMode", (isBlackboardMode) => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = isBlackboardMode ? 'black' : 'white';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });
    socket.on("setCanvasBounds", (bounds) => {
      canvasBoundsRef.current.width = bounds.width;
      canvasBoundsRef.current.height = bounds.height;
    });

    window.addEventListener("deviceorientation", handleOrientation, true);
  });

  return (
    <IonApp>
      <div className="main">
        <CanvasContext.Provider value={{ lineWidthRef, lineColorRef }}>
          <SocketContext.Provider value={{ socket }}>
            <PhoneContext.Provider value={{ phoneBoundsRef }}>
              <TheCurrentScreen roomIdRef={roomIdRef} />
            </PhoneContext.Provider>
          </SocketContext.Provider>
        </CanvasContext.Provider>
      </div>
    </IonApp>
  );
}
