import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {setupConfig} from '@ionic/react';

setupConfig({
  scrollAssist: false,
  autoFocusAssist: false
});

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
