import React from 'react';

const CanvasContext = React.createContext({
  lineColorRef: null,
  lineWidthRef: null,
  canvasBoundsRef: null
});

export default CanvasContext;
