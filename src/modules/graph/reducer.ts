import { ActionType } from 'typesafe-actions';
import { isEqual } from 'lodash';
import { SimpleVideoGraph, Edge as SimpleVideoGraphEdge } from '../../model/SimpleVideoGraph';
import * as Graph from '@davidisaaclee/graph';
import * as Constants from './constants';
import * as actions from './actions';
import * as uuid from 'uuid';

export interface State {
	graph: SimpleVideoGraph;
	outputNodeKey: string | null;
};

const initialState: State = {
	graph: {
		nodes: {
			'constant': {
				type: 'constant',
				uniforms: {
					value: {
						type: '3f',
						data: [0, 0, 0],
					}
				},
			},
			'oscillator': {
				type: 'oscillator',
				uniforms: {
					frequency: {
						type: 'f',
						data: 20,
					}
				},
			},
			'lfo': {
				type: 'oscillator',
				uniforms: {
					frequency: {
						type: 'f',
						data: 11,
					}
				},
			},
		},
		edges: {
			'constant -> oscillator.rotation': {
				src: 'oscillator',
				dst: 'constant',
				metadata: {
					inlet: 'rotation'
				}
			},
			'constant -> lfo.rotation': {
				src: 'lfo',
				dst: 'constant',
				metadata: {
					inlet: 'rotation'
				}
			},
		}
	},
	outputNodeKey: 'oscillator'
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
			return (({ toNodeKey, fromNodeKey, inletKey }) => {
				const edgeToInsert = {
					src: toNodeKey,
					dst: fromNodeKey,
					metadata: {
						inlet: inletKey
					}
				};

				if (Graph.findEdge(state.graph, (e: SimpleVideoGraphEdge) => edgeToInsert === e) != null) {
					return state;
				} else {
					// Remove edges already connected to this inlet.
					const edgesToRemove =
						Graph.filterEdges(state.graph, edge =>
							edge.src === toNodeKey && edge.metadata.inlet === inletKey);

					const graphWithExistingEdgesRemoved =
						Object.keys(edgesToRemove).reduce(
							(graph, edgeKeyToRemove) => Graph.removeEdge(graph, edgeKeyToRemove),
							state.graph)

					return {
						...state,
						graph: Graph.insertEdge(graphWithExistingEdgesRemoved, edgeToInsert, uuid())
					};
				}
			})(action.payload);

		case Constants.DISCONNECT_NODES:
			return (({ toNodeKey, fromNodeKey, inletKey }) => {
				const edge = {
					src: action.payload.toNodeKey,
					dst: action.payload.fromNodeKey,
					metadata: {
						inlet: action.payload.inletKey
					}
				};

				const edgeKeyToRemove = Graph.findEdge(state.graph, (e: SimpleVideoGraphEdge) => isEqual(edge, e));

				if (edgeKeyToRemove == null) {
					return state;
				} else {
					return {
						...state,
						graph: Graph.removeEdge(state.graph, edgeKeyToRemove)
					};
				}
			})(action.payload);

		case Constants.INSERT_NODE:
			return {
				...state,
				graph: Graph.insertNode(
					state.graph,
					action.payload.node,
					action.payload.id)
			};

		default:
			return state;
	}
};


