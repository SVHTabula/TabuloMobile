import React, { useState, useEffect, useContext } from "react";
import RoomContext from "../context/room";
import TheDrawingCanvas from "./TheDrawingCanvas";
import TheRoomConnectScreen from "./TheRoomConnectScreen";
import SocketContext from "../context/socket";
import PhoneContext from "../context/phone";

export default function TheCurrentScreen({ roomIdRef }) {
  const [roomId, setRoomId] = useState('');
  const { socket } = useContext(SocketContext);
  const { phoneBounds } = useContext(PhoneContext);

  useEffect(() => {
    socket.on("leaveRoom", () => {
      setRoomId('');
    });
  }, [socket]);

  useEffect(() => {
    if (!roomId) return;
    roomIdRef.current = roomId;
    socket.emit("setPhoneBounds", phoneBounds);
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
