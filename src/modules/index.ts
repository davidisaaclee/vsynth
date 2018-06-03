import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';
import * as Graph from './graph';

export interface State {
	graph: Graph.State;
};

type Action = ActionType<typeof Graph.actions>;

export const reducer = combineReducers<State, Action>({
	graph: Graph.reducer,
});

