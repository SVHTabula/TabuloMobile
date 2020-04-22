import React, { useEffect, useContext, useRef } from 'react';
import { IonApp } from '@ionic/react';
import SocketContext from "./context/socket";
import CanvasContext from "./context/canvas";
import io from 'socket.io-client';
import './App.css';
import Canvas from './canvas';

const socket = io('https://tabula-web.herokuapp.com');

export default function App() {
  const lineWidthRef = useRef(5);
  const lineColorRef = useRef('#ffffff');

  useEffect(() => {
    socket.on("setColor", (color) => {
      lineColorRef.current = color;
    });
    socket.on("setWidth", (width) => {
      lineWidthRef.current = width;
    });
  });

  return (
    <IonApp>
      <div className="main">
        <CanvasContext.Provider value={{lineWidthRef, lineColorRef}}>
          <SocketContext.Provider value={{socket}}>
            <Canvas />
          </SocketContext.Provider>
        </CanvasContext.Provider>
      </div>
    </IonApp>
  );
}
