import React, { Component } from 'react';

import { IonApp } from '@ionic/react';

import './App.css';
import Canvas from './canvas';

class App extends Component {
  render() {
    return (
      <IonApp>
        <div className="main">
          <Canvas />
        </div>
      </IonApp>
    );
  }
}

export default App;
