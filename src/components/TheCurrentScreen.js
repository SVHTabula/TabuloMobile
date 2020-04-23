import React, { useState, useEffect, useContext } from "react";
import RoomContext from "../context/room";
import TheDrawingCanvas from "./TheDrawingCanvas";
import TheRoomConnectScreen from "./TheRoomConnectScreen";
import SocketContext from "../context/socket";
import CanvasContext from "../context/canvas";

export const roomIdRef = React.createRef();

export default function TheCurrentScreen() {
  const [roomId, setRoomId] = useState(false);
  const { socket } = useContext(SocketContext);
  const { phoneBoundsRef } = useContext(CanvasContext);

  useEffect(() => {
    if (!roomId) return;
    roomIdRef.current = roomId;
    socket.emit("setPhoneBounds", phoneBoundsRef.current);
  });

  return (
    <RoomContext.Provider value={{ roomId, setRoomId }}>
      { roomId ?
        <TheDrawingCanvas /> :
        <TheRoomConnectScreen />
      }
    </RoomContext.Provider>
  );
}
