import { pickBy as _pickBy, ValueKeyIteratee } from 'lodash';
import { ActionType } from 'typesafe-actions';
import { VideoNode, videoModuleSpecFromModuleType } from '../../model/SimpleVideoGraph';
import * as Kit from '../../model/Kit';
import * as Constants from './constants';
import * as actions from './actions';
import {
	defaultConstantBusIndex, nullSendBusIndex
} from '../../constants';

export interface State {
	// A seed used to generate the next node key.
	nodeKeySeed: number,

	// The set of all nodes.
	// Maps a string node key to a VideoNode.
	nodes: { [key: string]: VideoNode };

	nodeOrder: string[];

	// Maps each node key to a dictionary,
	// which maps inlet keys of that node to a bus index.
	inletConnections: { [nodeKey: string]: { [inletKey: string]: number } };

	// Maps each node key to a connected bus index.
	outletConnections: { [nodeKey: string]: number };

	busCount: number;
};

const initialState: State = {
	nodeKeySeed: 0,
	nodes: {
		'output': videoModuleSpecFromModuleType('identity'),
		'default-constant': videoModuleSpecFromModuleType('constant'),
	},

	nodeOrder: ['output', 'default-constant'],
	inletConnections: {},
	outletConnections: {
		'default-constant': defaultConstantBusIndex,
		'output': nullSendBusIndex,
	},
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
			return insertInletConnection(
				state,
				action.payload.nodeKey,
				action.payload.inletKey,
				action.payload.busIndex);

		case Constants.SET_OUTLET_CONNECTION:
			return (({ nodeKey, busIndex }) => ({
				...state,
				outletConnections: {
					...state.outletConnections,
					[nodeKey]: busIndex
				}
			}))(action.payload);

		case Constants.INSERT_NODE:
			return ((nodeKey, node) => {
				state = connectAllInlets(state, node, nodeKey, defaultConstantBusIndex);
				state = insertNode(state, node, nodeKey);
				state = incrementNodeKeySeed(state);
				return state;
			})(action.payload.id, action.payload.node);

		case Constants.PREVIEW_PARAMETER:
		case Constants.SET_PARAMETER:
			return (({ nodeKey, parameterKey, value }) => {
				const node = {
					...state.nodes[nodeKey],
					parameters: {
						...state.nodes[nodeKey].parameters,
						[parameterKey]: value
					}
				};

				// Write new uniforms from parameter change to node.
				const videoModule = Kit.moduleForNode(node);

				if (node.nodeType === 'shader') {
					if (videoModule.details.type !== 'shader') {
						throw new Error("Mismatched node and module types");
					}

					node.uniforms = {
						...node.uniforms,
						...videoModule.details.parametersToUniforms(node.parameters)
					};
				}

				return {
					...state,
					nodes: {
						...state.nodes,
						[nodeKey]: node
					}
				};
			})(action.payload);

		case Constants.ADD_BUS:
			return {
				...state,
				busCount: state.busCount + 1
			};

		case Constants.REMOVE_NODE:
			return (nodeKeyToDelete => ({
				...state,
				nodes: pickBy(
					state.nodes,
					(_, nodeKey) => nodeKey !== nodeKeyToDelete),
				nodeOrder: (state.nodeOrder
					.filter(nodeKey => nodeKey !== nodeKeyToDelete)),
				inletConnections: pickBy(
					state.inletConnections,
					(_, nodeKey) => nodeKey !== nodeKeyToDelete),
				outletConnections: pickBy(
					state.outletConnections,
					(_, nodeKey) => nodeKey !== nodeKeyToDelete),
			}))(action.payload);

		case Constants.RESET_ALL:
			return initialState;

		default:
			return state;
	}
};

function insertInletConnection(state: State, nodeKey: string, inletKey: string, busIndex: number): State {
	return {
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
	};
}

function incrementNodeKeySeed(state: State): State {
	return {
		...state,
		nodeKeySeed: state.nodeKeySeed + 1
	};
}

function insertNode(state: State, node: VideoNode, nodeKey: string): State {
	return {
		...state,
		nodes: {
			...state.nodes,
			[nodeKey]: node
		},
		nodeOrder: [...state.nodeOrder, nodeKey]
	};
}

function connectAllInlets(state: State, node: VideoNode, nodeKey: string, busIndex: number): State {
	return Kit.moduleForNode(node).inlets.keys
		.reduce((state, inletKey) => (
			insertInletConnection(
				state,
				nodeKey,
				inletKey,
				busIndex)),
			state);
}

// Typing shim :(
// This is needed because _.pickBy is typed to return a Partial<T>, where T is
// the original object.
// Partial<T> is not assignable to T under TypeScript's rules.
// However, if T is a general map type (i.e. Record<string, V>),
// I believe that Partial<T> can be safely assigned to T.
function pickBy<V, T extends Record<string, V>>(
	object: T | null | undefined,
	predicate?: ValueKeyIteratee<T[keyof T]>
): T {
	return _pickBy(object, predicate) as T;
}

