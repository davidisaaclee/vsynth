import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { reducer as rootReducer } from './modules';

const devToolsKey = '__REDUX_DEVTOOLS_EXTENSION__';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer =
	persistReducer(persistConfig, rootReducer);

function configureStore(initialState?: object) {
  return createStore(
		persistedReducer,
		window[devToolsKey] && window[devToolsKey]()
	);
}

export const store = configureStore(persistedReducer);
export const persistor = persistStore(store);

