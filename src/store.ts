import { createStore } from 'redux';
import { reducer as rootReducer } from './modules';

const devToolsKey = '__REDUX_DEVTOOLS_EXTENSION__';

function configureStore(initialState?: object) {
  return createStore(
		rootReducer,
		window[devToolsKey] && window[devToolsKey]()
	);
}

// pass an optional param to rehydrate state on app start
const store = configureStore();

// export store singleton instance
export default store;
