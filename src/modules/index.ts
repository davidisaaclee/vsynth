import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';
import undoable, { StateWithHistory } from 'redux-undo';
import * as GraphConstants from './graph/constants';
import * as Graph from './graph';
import * as App from './app';

export interface State {
	graph: StateWithHistory<Graph.State>;
	app: App.State;
};

type Action = ActionType<typeof Graph.actions | typeof App.actions>;

export const reducer = combineReducers<State, Action>({
	graph: undoable(Graph.reducer, {
		filter: (action) => {
			switch (action.type) {
				case GraphConstants.PREVIEW_PARAMETER:
					return false;
				default:
					return true;
			}
		}
	}),
	app: App.reducer,
});

