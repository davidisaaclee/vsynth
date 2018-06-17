import { createSelector, Selector } from 'reselect';
import * as Graph from '@davidisaaclee/graph';
import { State as RootState } from './index';
import { SimpleVideoGraph, VideoModuleSpecification } from '../model/SimpleVideoGraph';

const nodes =
	(state: RootState) => state.graph.nodes;

const busConnections =
	(state: RootState) => state.graph.busConnections;

const nodeOrder =
	(state: RootState) => state.graph.nodeOrder;

const orderedNodes = createSelector(
	[nodes, nodeOrder],
	(nodes: Record<string, VideoModuleSpecification>, nodeOrder: string[]) => {
		return nodeOrder.map(key => ({
			key,
			node: nodes[key]
		}));
	});

export const graph: Selector<RootState, SimpleVideoGraph> = createSelector(
	[
		orderedNodes,
		busConnections
	],
	(nodes, busConnections) => {
		let result = Graph.empty;
		result = nodes.reduce(
			(graph, { key, node }) => Graph.insertNode(graph, node, key),
			result);
		// TODO: Calculate edges from bus connections; add to graph
		return result;
	});

export const outputNodeKey =
	(state: RootState) => state.graph.outputNodeKey;

