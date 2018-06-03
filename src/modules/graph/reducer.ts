import { ActionType } from 'typesafe-actions';
import { INCREMENT } from './constants';
import * as actions from './actions';

export interface State {
	counter: number;
};

const initialState: State = {
	counter: 0,
};

type RootAction = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: RootAction) => {
	switch (action.type) {
		case INCREMENT:
			return {
				...state,
				counter: state.counter + 1
			};

		default:
			return state;
	}
};


