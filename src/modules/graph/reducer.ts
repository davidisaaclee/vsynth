import { ActionType } from 'typesafe-actions';
import { isEqual, entries } from 'lodash';
import {
	SimpleVideoGraph, Edge as SimpleVideoGraphEdge, VideoModuleSpecification
} from '../../model/SimpleVideoGraph';
import { modules, videoModuleSpecFromModule } from '../../model/Kit';
import * as Graph from '@davidisaaclee/graph';
import * as Constants from './constants';
import * as actions from './actions';
import * as uuid from 'uuid';

export interface State {
	graph: SimpleVideoGraph;
	outputNodeKey: string | null;

	nodeOrder: Array<string>;
	// maps lane index (using `lanes`) to bus index
	busConnections: { [laneIndex: number]: number };
	busCount: number;
};

const initialState: State = {
	graph: (() => {
		const nodes = {
			'output': videoModuleSpecFromModule(modules.identity),
			'constant': videoModuleSpecFromModule(modules.constant),
		};

		return entries(nodes).reduce(
			(graph, [key, node]) => Graph.insertNode(graph, node, key),
			Graph.empty);
	})(),
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
						Graph.filterEdges(state.graph, (edge: SimpleVideoGraphEdge) =>
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
					action.payload.id),
				nodeOrder: [...state.nodeOrder, action.payload.id]
			};

		case Constants.SET_PARAMETER:
			return {
				...state,
				graph: Graph.mutateNode(
					state.graph,
					action.payload.nodeKey,
					(node: VideoModuleSpecification) => ({
						...node,
						parameters: {
							...node.parameters,
							[action.payload.parameterKey]: action.payload.value
						}
					}))
			};

		default:
			return state;
	}
};


