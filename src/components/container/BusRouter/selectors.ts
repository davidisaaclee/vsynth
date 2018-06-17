import { entries, flatMap } from 'lodash';
import { createSelector } from 'reselect';
import * as Graph from '@davidisaaclee/graph';
import { State as RootState } from '../../../modules';
import { SimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import { modules as videoModules } from '../../../model/Kit';
import { Lane } from './types';

export const busCount =
	(state: RootState) => state.graph.busCount;

export const graph =
	sharedSelectors.graph;


export const connections = createSelector(
	(state: RootState) => state.graph.busConnections,
	(connections: Record<number, number>) => entries(connections).map(([laneIndex, busIndex]) => ({
		laneIndex: parseInt(laneIndex, 10),
		busIndex
	})));

export const lanes = createSelector(
	[
		(state: RootState) => state.graph.nodeOrder,
		graph
	],
	(nodeOrder: string[], graph: SimpleVideoGraph) => flatMap(
		nodeOrder,
		nodeKey => {
			const videoMod =
				videoModules[Graph.nodeForKey(graph, nodeKey)!.type];

			const inletKeys =
				videoMod.inlets == null
				? []
				: Object.keys(videoMod.inlets.uniformMappings);

			return [
				{
					type: 'outlet',
					name: nodeKey,
					nodeKey
				},
				...inletKeys.map(inletKey => ({
					type: 'inlet',
					name: `${nodeKey} * ${inletKey}`,
					nodeKey,
					inletKey
				}))
			] as Lane[];
		}));

