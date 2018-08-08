import { ActionType } from 'typesafe-actions';
import * as Constants from './constants';
import * as Modals from './modals';
import * as actions from './actions';

export interface State {
	modal: Modals.Modal | null;

	// Temporary changes to node parameters
	previewedParameterChanges: { [nodeKey: string]: { [parameterKey: string]: number } };

	// If `true`, router hides all inlet lanes without connections.
	routerIsCollapsed: boolean,
}

const initialState: State = {
	modal: null,
	previewedParameterChanges: {},
	routerIsCollapsed: false,
};

type Action = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: Action) => {
	switch (action.type) {
		case Constants.PREVIEW_PARAMETER:
			return (({ nodeKey, parameterKey, value }) => {
				return {
					...state,
					previewedParameterChanges: {
						...state.previewedParameterChanges,
						[nodeKey]: {
							...state.previewedParameterChanges[nodeKey],
							[parameterKey]: value
						}
					}
				};
			})(action.payload);

		case Constants.CLEAR_PREVIEWED_PARAMETER:
			return {
				...state,
				previewedParameterChanges: {}
			};

		case Constants.SET_MODAL:
			return {
				...state,
				modal: action.payload
			};

		case Constants.SET_ROUTER_COLLAPSED:
			return {
				...state,
				routerIsCollapsed: action.payload
			};

		default:
			return state;
	}
};


