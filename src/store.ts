import { createStore } from 'redux';
import { createMigrate, persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { reducer as rootReducer } from './modules';

const devToolsKey = '__REDUX_DEVTOOLS_EXTENSION__';

function clearPastStateMigration(state: any): any {
	return {};
}

const migrations = {
	3: clearPastStateMigration,
};

const persistConfig = {
  key: 'root',
  storage,
	version: 3,
	migrate: createMigrate(migrations, { debug: process.env.NODE_ENV === 'development' })
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
// persistor.purge();
