import React from 'react';

const RoomContext = React.createContext({
  roomId: null,
  setRoomId: null,
  roomIdRef: null
});

export default RoomContext;
