import { ActionType } from 'typesafe-actions';
import * as Constants from './constants';
import * as Modals from './modals';
import * as actions from './actions';

export interface State {
	modal: Modals.Modal | null;
}

const initialState: State = {
	modal: null,
};

type Action = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: Action) => {
	switch (action.type) {
		case Constants.SET_MODAL:
			return {
				...state,
				modal: action.payload
			};

		default:
			return state;
	}
};


