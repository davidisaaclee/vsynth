import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';
import * as Graph from './graph';
import * as App from './app';

export interface State {
	graph: Graph.State;
	app: App.State;
};

type Action = ActionType<typeof Graph.actions | typeof App.actions>;

export const reducer = combineReducers<State, Action>({
	graph: Graph.reducer,
	app: App.reducer,
});

