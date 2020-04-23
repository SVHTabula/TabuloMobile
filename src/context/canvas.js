import React from 'react';

const CanvasContext = React.createContext({
  lineColorRef: null,
  lineWidthRef: null,
  canvasBounds: {}
});

export default CanvasContext;
