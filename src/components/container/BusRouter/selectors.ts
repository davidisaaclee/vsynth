import { get, flatMap } from 'lodash';
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

export const connections: Selector<RootState, Array<{ laneIndex: number, busIndex: number }>> = createSelector(
	[lanes, sharedSelectors.inletConnections, sharedSelectors.outletConnections],
	(
		lanes: Lane[],
		inletConnections: { [nodeKey: string]: { [inletKey: string]: number } },
		outletConnections: { [nodeKey: string]: number }
	) => (
		lanes.map((lane, laneIndex) => (
			lane.type === 'inlet'
			? {
				laneIndex,
				busIndex: get(inletConnections, [lane.nodeKey, lane.inletKey], -1)
			}
			: {
				laneIndex,
				busIndex: get(outletConnections, [lane.nodeKey], -1)
			}
		))
	));

