import React, { useEffect, useRef } from 'react';
import { IonApp } from '@ionic/react';
import SocketContext from "./context/socket";
import CanvasContext from "./context/canvas";
import io from "socket.io-client";
import "./App.css";
import Canvas from "./canvas";

const socket = io("https://tabula-web.herokuapp.com");

export default function App() {
  const lineWidthRef = useRef(5);
  const lineColorRef = useRef("#ffffff");

  let x = 0, y = 0;

  function moveScreen(direction) {
    switch(direction) {
      case "UP":
        y-=1;
        break;
      case "DOWN":
        y+=1;
        break;
      case "LEFT":
        x-=1;
        break;
      case "RIGHT":
        x+=1;
        break;
      default:
        console.log("error");
    }
    socket.emit("setPhoneBounds", {
      width: window.innerWidth,
      height: window.innerHeight,
      x: x,
      y: y
    });
  }

  function handleOrientation(event) {
    var absolute = event.absolute;
    var alpha = event.alpha;
    var beta = event.beta;
    var gamma = event.gamma;
    if (beta < 170 && beta > 0) {
      moveScreen("UP");
    }
    if (beta > -170 && beta < 0) {
      moveScreen("DOWN");
    }
    if (gamma < -30) {
      moveScreen('LEFT');
    }
    if (gamma > 30) {
      moveScreen('RIGHT')
    }
  }

  useEffect(() => {
    socket.on("setColor", (color) => {
      lineColorRef.current = color;
    });
    socket.on("setWidth", (width) => {
      lineWidthRef.current = width;
    });
    window.addEventListener("deviceorientation", handleOrientation, true);
    socket.emit("setPhoneBounds", {
      width: window.innerWidth,
      height: window.innerHeight,
      x: x,
      y: y
    });
  }, []);

  return (
    <IonApp>
      <div className="main">
        <CanvasContext.Provider value={{ lineWidthRef, lineColorRef }}>
          <SocketContext.Provider value={{ socket }}>
            <Canvas />
          </SocketContext.Provider>
        </CanvasContext.Provider>
      </div>
    </IonApp>
  );
}
