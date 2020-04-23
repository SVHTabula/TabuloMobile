import React, { useState, useContext } from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SocketContext from "../context/socket";

export default function TheConnectToRoomDialog({ setJoinedRoom }) {
  const { socket } = useContext(SocketContext);

  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  return (
    <Dialog open={true}>
      <DialogTitle style={{margin: 0, paddingBottom: 5, paddingTop: 10}}>
        <span style={{fontWeight: 'bold'}}>
          Connect to Tabula Room
        </span>
      </DialogTitle>
      <TextField
        label="Room ID"
        variant="outlined"
        style={{marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 5}}
        value={roomId}
        onChange={setRoomId}
      />
      <TextField
        label="Admin Password"
        variant="outlined"
        style={{marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 5}}
        value={roomPassword}
        onChange={setRoomPassword}
      />
      <Button
        variant="contained"
        style={{margin: 10}}
        color="primary"
        onClick={() => {
          socket.emit("connectToRoom", roomId, roomPassword);
        }}
      >Connect</Button>
    </Dialog>
  );
}
