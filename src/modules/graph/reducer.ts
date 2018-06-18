import { ActionType } from 'typesafe-actions';
import { VideoModuleSpecification } from '../../model/SimpleVideoGraph';
import { modules, videoModuleSpecFromModule } from '../../model/Kit';
import * as Constants from './constants';
import * as actions from './actions';

export interface State {
	nodes: { [key: string]: VideoModuleSpecification };
	outputNodeKey: string | null;

	nodeOrder: string[];
	inletConnections: { [nodeKey: string]: { [inletKey: string]: number } };
	outletConnections: { [nodeKey: string]: number };
	busCount: number;
};

const initialState: State = {
	nodes: {
		'output': videoModuleSpecFromModule(modules.identity),
		'default-constant': videoModuleSpecFromModule(modules.constant),
	},
	outputNodeKey: 'output',

	nodeOrder: ['output', 'default-constant'],
	inletConnections: {},
	outletConnections: {},
	busCount: 5,
};

type RootAction = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: RootAction) => {
	switch (action.type) {
		case Constants.SET_MASTER_OUTPUT:
			return {
				...state,
				outputNodeKey: action.payload,
			};

		case Constants.SET_INLET_CONNECTION:
			return (({ nodeKey, inletKey, busIndex }) => ({
				...state,
				inletConnections: {
					...state.inletConnections,
					[nodeKey]: {
						...(state.inletConnections[nodeKey] == null
							? {}
							: state.inletConnections[nodeKey]),
						[inletKey]: busIndex
					}
				}
			}))(action.payload);

		case Constants.SET_OUTLET_CONNECTION:
			return (({ nodeKey, busIndex }) => ({
				...state,
				outletConnections: {
					...state.outletConnections,
					[nodeKey]: busIndex
				}
			}))(action.payload);

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

		case Constants.ADD_BUS:
			return {
				...state,
				busCount: state.busCount + 1
			};

		default:
			return state;
	}
};


