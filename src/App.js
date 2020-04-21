import React, { Component } from 'react';

import { IonApp } from '@ionic/react';

import './App.css';
import Canvas from './canvas';

class App extends Component {
  render() {
    return (
      <IonApp>
        <h3 style={{ textAlign: 'center' }}>Tabula</h3>
        <div className="main">
          <div className="color-guide">
            <h5>Color Guide</h5>
            <div className="user user">User</div>
            <div className="user guest">Guest</div>
          </div>
          <Canvas />
        </div>
      </IonApp>
    );
  }
}

export default App;
