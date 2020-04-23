import React, { useEffect, useRef } from 'react';
import { IonApp } from '@ionic/react';
import SocketContext from "./context/socket";
import CanvasContext from "./context/canvas";
import PhoneContext from "./context/phone";
import io from "socket.io-client";
import "./App.css";
import TheCurrentScreen, { roomIdRef } from "./components/TheCurrentScreen";

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

  useEffect(() => {
    socket.on("setColor", (color) => {
      lineColorRef.current = color;
    });
    socket.on("setWidth", (width) => {
      lineWidthRef.current = width;
    });
    socket.on("leaveRoom", (width) => {

    });

    function handleOrientation(event) {
      if (!roomIdRef.current) return;
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

      socket.emit("setPhoneBounds", phoneBoundsRef.current);
      const beta = event.beta;
      const gamma = event.gamma;
      if (beta < 170 && beta > 0) moveScreen("LEFT");
      if (beta > -170 && beta < 0) moveScreen("RIGHT");
      if (gamma < -30) moveScreen('DOWN');
      if (gamma > 30) moveScreen('UP')
    }

    window.addEventListener("deviceorientation", handleOrientation, true);
  });

  return (
    <IonApp>
      <div className="main">
        <CanvasContext.Provider value={{ lineWidthRef, lineColorRef }}>
          <SocketContext.Provider value={{ socket }}>
            <PhoneContext.Provider value={{ phoneBoundsRef }}>
              <TheCurrentScreen />
            </PhoneContext.Provider>
          </SocketContext.Provider>
        </CanvasContext.Provider>
      </div>
    </IonApp>
  );
}
