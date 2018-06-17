import { ActionType } from 'typesafe-actions';
import { VideoModuleSpecification } from '../../model/SimpleVideoGraph';
import { modules, videoModuleSpecFromModule } from '../../model/Kit';
import * as Constants from './constants';
import * as actions from './actions';

export interface State {
	nodes: { [key: string]: VideoModuleSpecification };
	outputNodeKey: string | null;

	nodeOrder: string[];
	// maps lane index (using `nodeOrder`) to bus index
	busConnections: { [laneIndex: number]: number };
	busCount: number;
};

const initialState: State = {
	nodes: {
		'output': videoModuleSpecFromModule(modules.identity),
		'constant': videoModuleSpecFromModule(modules.constant),
	},
	outputNodeKey: 'output',

	nodeOrder: [
		'output', 'constant',
	],
	busConnections: {
	},
	busCount: 1,
};

type RootAction = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: RootAction) => {
	switch (action.type) {
		case Constants.SET_MASTER_OUTPUT:
			return {
				...state,
				outputNodeKey: action.payload,
			};

		case Constants.CONNECT_NODES:
			return state;

		case Constants.DISCONNECT_NODES:
			return state;

		case Constants.INSERT_NODE:
			return {
				...state,
				nodes: {
					...state.nodes,
					[action.payload.id]: action.payload.node
				},
				nodeOrder: [
					...state.nodeOrder,
					action.payload.id
				]
			};

		case Constants.SET_PARAMETER:
			return (({ nodeKey, parameterKey, value }) => ({
				...state,
				nodes: {
					...state.nodes,
					[nodeKey]: {
						...state.nodes[nodeKey],
						parameters: {
							...state.nodes[nodeKey].parameters,
							[parameterKey]: value
						}
					}
				}
			}))(action.payload);

		default:
			return state;
	}
};


