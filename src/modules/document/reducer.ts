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
	// A key which is unique to each unique State.
	// This is used to quickly figure out whether the document has changed, without
	// performing a deep equality check on the graph.
	editHash: number,

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
	editHash: 0,
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

function incrementEditHash(state: State): State {
	state.editHash += 1;
	return state;
}

export const reducer = (state: State = initialState, action: RootAction) => {
	switch (action.type) {
		case Constants.SET_INLET_CONNECTION:
			return incrementEditHash(insertInletConnection(
				state,
				action.payload.nodeKey,
				action.payload.inletKey,
				action.payload.busIndex));

		case Constants.SET_OUTLET_CONNECTION:
			return (({ nodeKey, busIndex }) => (incrementEditHash({
				...state,
				outletConnections: {
					...state.outletConnections,
					[nodeKey]: busIndex
				}
			})))(action.payload);

		case Constants.INSERT_NODE:
			return ((nodeKey, node) => {
				state = connectAllInlets(state, node, nodeKey, defaultConstantBusIndex);
				state = insertNode(state, node, nodeKey);
				state = incrementNodeKeySeed(state);
				state = incrementEditHash(state);
				return state;
			})(action.payload.id, action.payload.node);

		case Constants.SET_PARAMETER:
			return (({ nodeKey, parameterKey, value }) => {
				const node = {
					...state.nodes[nodeKey],
					parameters: {
						...state.nodes[nodeKey].parameters,
						[parameterKey]: value
					}
				};

				return incrementEditHash({
					...state,
					nodes: {
						...state.nodes,
						[nodeKey]: node
					},
				});
			})(action.payload);

		case Constants.ADD_BUS:
			return incrementEditHash({
				...state,
				busCount: state.busCount + 1
			});

		case Constants.REMOVE_NODE:
			return (nodeKeyToDelete => incrementEditHash({
				...state,
				nodes: omit(
					state.nodes,
					nodeKeyToDelete),
				nodeOrder: (state.nodeOrder
					.filter(nodeKey => nodeKey !== nodeKeyToDelete)),
				inletConnections: omit(
					state.inletConnections,
					nodeKeyToDelete),
				outletConnections: omit(
					state.outletConnections,
					nodeKeyToDelete),
			}))(action.payload);

		case Constants.RESET_ALL:
			return incrementEditHash({ ...initialState });

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

function omit<V, T extends Record<string, V>>(
	object: T | null | undefined,
	keyToOmit: keyof T
): T {
	return pickBy(object, (value, key) => keyToOmit !== key);
}

