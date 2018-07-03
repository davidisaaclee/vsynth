import { combineReducers } from 'redux';
import { createMigrate, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { ActionType } from 'typesafe-actions';
import undoable, { StateWithHistory } from 'redux-undo';
import * as GraphConstants from './graph/constants';
import * as Graph from './graph';
import * as App from './app';


function clearPastStateMigration(state: any): any {
	return {};
}

const migrations = {
	5: clearPastStateMigration,
};
const persistRootConfig = {
  key: 'root',
  storage,
	version: 5,
	migrate: createMigrate(migrations, { debug: process.env.NODE_ENV === 'development' }),
	blacklist: ['graph'],
};

const graphMigrations = {
	2: clearPastStateMigration,
};

const persistGraphConfig = {
	key: 'graph',
	blacklist: ['previewedParameterChanges'],
	version: 2,
	migrate: createMigrate(graphMigrations, { debug: process.env.NODE_ENV === 'development' }),
	storage
};

export interface State {
	graph: StateWithHistory<Graph.State>;
	app: App.State;
};

type Action = ActionType<typeof Graph.actions | typeof App.actions>;

export const reducer = persistReducer(
	persistRootConfig,
	combineReducers<State, Action>({
		graph: persistReducer(persistGraphConfig, undoable(Graph.reducer, {
			filter: (action) => {
				switch (action.type) {
					case GraphConstants.PREVIEW_PARAMETER:
						return false;
					default:
						return true;
				}
			}
		})),
		app: App.reducer,
	}));

