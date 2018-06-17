import { entries, flatMap } from 'lodash';
import { createSelector, Selector } from 'reselect';
import { State as RootState } from '../../../modules';
import { SimpleVideoGraph, VideoModuleSpecification } from '../../../model/SimpleVideoGraph';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import { modules as videoModules } from '../../../model/Kit';
import { Lane } from './types';

export const busCount =
	sharedSelectors.busCount;

export const graph =
	sharedSelectors.graph;


export const connections = createSelector(
	[sharedSelectors.busConnections],
	(connections: Record<number, number>) => entries(connections).map(([laneIndex, busIndex]) => ({
		laneIndex: parseInt(laneIndex, 10),
		busIndex
	})));

export const lanes: Selector<RootState, Lane[]> = createSelector(
	[
		sharedSelectors.orderedNodes,
		graph
	],
	(nodeOrder: Array<{ key: string, node: VideoModuleSpecification }>, graph: SimpleVideoGraph) => flatMap(
		nodeOrder,
		({ key: nodeKey, node }) => {
			const videoMod =
				videoModules[node.type];

			const inletKeys =
				videoMod.inlets == null
				? []
				: videoMod.inlets.displayOrder;

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

