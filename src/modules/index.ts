import { combineReducers } from 'redux';
import { createMigrate, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { ActionType } from 'typesafe-actions';
import undoable, { StateWithHistory } from 'redux-undo';
import * as DocumentConstants from './document/constants';
import * as Document from './document';
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
	blacklist: ['document', 'app'],
};

const documentMigrations = {
	5: clearPastStateMigration,
};

const persistDocumentConfig = {
	key: 'document',
	blacklist: ['previewedParameterChanges'],
	version: 5,
	migrate: createMigrate(documentMigrations, { debug: process.env.NODE_ENV === 'development' }),
	storage
};

export interface State {
	document: StateWithHistory<Document.State>;
	app: App.State;
};

type Action = ActionType<typeof Document.actions | typeof App.actions>;

export const reducer = persistReducer(
	persistRootConfig,
	combineReducers<State, Action>({
		document: persistReducer(persistDocumentConfig, undoable(Document.reducer, {
			filter: (action) => {
				switch (action.type) {
					case DocumentConstants.PREVIEW_PARAMETER:
						return false;
					default:
						return true;
				}
			}
		})),
		app: App.reducer,
	}));

