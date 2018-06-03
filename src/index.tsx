import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import store from './store';

const e = React.createElement;

ReactDOM.render(
	e(Provider,
		{ store },
		e(App)),
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
