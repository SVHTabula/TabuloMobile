import React, {useState, useEffect} from "react";
import ControlCameraIcon from "@material-ui/icons/ControlCamera";
import CreateIcon from '@material-ui/icons/Create';

export default function ModeIcon({ isDragModeRef }) {
  const [isDragMode, setIsDragMode] = useState(isDragModeRef.current);

  useEffect(() => {
    isDragModeRef.current = isDragMode;
  }, [isDragMode]);

  if (isDragMode) {
    return <CreateIcon
      style={{color: 'white', position: 'absolute', top: 2, right: 2}}
      onClick={() => setIsDragMode(false)}
    />;
  } else {
    return <ControlCameraIcon
      style={{color: 'white', position: 'absolute', top: 2, right: 2}}
      onClick={() => setIsDragMode(true)}
    />
  }
}
