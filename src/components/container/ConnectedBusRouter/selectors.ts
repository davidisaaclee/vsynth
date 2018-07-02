import { get, flatMap } from 'lodash';
import { createSelector, Selector } from 'reselect';
import * as Graph from '@davidisaaclee/graph';
import { State as RootState } from '../../../modules';
import { SimpleVideoGraph, VideoNode } from '../../../model/SimpleVideoGraph';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import * as Kit from '../../../model/Kit';
import { Lane } from '../../presentational/BusRouter/types';
import { LaneIndexer } from './types';

// TYPING SHIM: Using string constants inline doesn't pass typechecker...
const inletType: 'inlet' = 'inlet';
const outletType: 'outlet' = 'outlet';

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
			const inletKeys =
				videoMod.inlets.keys;

			return [
				{
					type: outletType,
					name: nodeKey,
					nodeKey
				},
				...inletKeys.map(inletKey => ({
					type: inletType,
					name: `${nodeKey} * ${inletKey}`,
					nodeKey,
					inletKey,
					scale: (videoMod.inlets.associatedParameters[inletKey] == null
						? null
						: {
							key: videoMod.inlets.associatedParameters[inletKey],
							value: node.parameters[videoMod.inlets.associatedParameters[inletKey]]
						})
				}))
			];
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


export const laneIndexer: Selector<RootState, LaneIndexer> =
	createSelector(
		[lanes, graph],
		(lanes, graph) => (laneIndex: number) => {
			const lane = lanes[laneIndex];
			if (lane.type === 'inlet') {
				const node = Graph.nodeForKey(graph, lane.nodeKey);
				if (node == null) {
					throw new Error("Lane referred to node which was not in graph.");
				}

				const videoModule = Kit.moduleForNode(node);
				const parameterKey = videoModule.inlets.associatedParameters[lane.inletKey];

				return {
					type: inletType,
					nodeKey: lane.nodeKey,
					inletKey: lane.inletKey,
					...(parameterKey == null
						? {}
						: {
							scale: {
								parameterKey,
								value: node!.parameters[parameterKey],
							}
						})
				};
			} else {
				return {
					type: outletType,
					nodeKey: lane.nodeKey,
				};
			}
		});

