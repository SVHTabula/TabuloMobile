import React, {useState, useEffect} from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

export default function TheConnectToRoomDialog({ setJoinedRoom }) {
  return (
    <Dialog open={true}>
      <DialogTitle style={{margin: 0, paddingBottom: 5, paddingTop: 10}}>
        <span style={{fontWeight: 'bold'}}>
          Connect to Tabula Room
        </span>
      </DialogTitle>
      <TextField label="Room ID" variant="outlined" style={{marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 5}} />
      <TextField label="Room Password" variant="outlined" style={{marginLeft: 10, marginRight: 10, marginBottom: 0, marginTop: 5}} />
      <Button variant="contained" style={{margin: 10}} color="primary">Connect</Button>
    </Dialog>
  );
}
