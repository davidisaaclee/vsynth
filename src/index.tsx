import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { store, persistor } from './store';

const e = React.createElement;

ReactDOM.render(
	e(Provider,
		{ store },
		e(PersistGate,
			{ persistor, loading: null },
			e(App))),
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();

