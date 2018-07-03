import { createStore } from 'redux';
import { persistStore } from 'redux-persist';

import { reducer as rootReducer } from './modules';

const devToolsKey = '__REDUX_DEVTOOLS_EXTENSION__';

function configureStore(initialState?: object) {
  return createStore(
		rootReducer,
		window[devToolsKey] && window[devToolsKey]()
	);
}

export const store = configureStore(rootReducer);
export const persistor = persistStore(store);
// persistor.purge();
