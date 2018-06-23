import { get, flatMap } from 'lodash';
import { createSelector, Selector } from 'reselect';
import { State as RootState } from '../../../modules';
import { SimpleVideoGraph, VideoNode } from '../../../model/SimpleVideoGraph';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import * as Kit from '../../../model/Kit';
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
	(nodeOrder: Array<{ key: string, node: VideoNode }>, graph: SimpleVideoGraph) => flatMap(
		nodeOrder,
		({ key: nodeKey, node }) => {
			const videoMod =
				Kit.moduleForNode(node);

			const inletKeys = videoMod.inlets.keys;

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
		}).filter(lane => {
			// Hide the lanes for the default constant node.
			if (lane.nodeKey === 'default-constant') {
				return false;
			}

			// Hide the outlet lane for the master output.
			if (lane.nodeKey === 'output' && lane.type === 'outlet') {
				return false;
			}

			return true;
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

