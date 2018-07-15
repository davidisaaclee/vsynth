import { mapValues, values, flatMap } from 'lodash';
import { createSelector, Selector } from 'reselect';
import * as Graph from '@davidisaaclee/graph';
import { State as RootState } from './index';
import { SimpleVideoGraph, VideoNode } from '../model/SimpleVideoGraph';
import { ModuleConfigurationType } from '../model/VideoModule';
import * as Kit from '../model/Kit';
import { Inlet } from '../model/Inlet';
import { Outlet } from '../model/Outlet';
import { combinations } from '../utility/combinations';
import { defaultConstantBusIndex } from '../constants';

export const document =
	(state: RootState) => state.document.present;

const app =
	(state: RootState) => state.app;

export const busCount =
	createSelector(
		document,
		d => d.busCount);

export const inletConnections =
	createSelector(
		document,
		d => d.inletConnections);

export const outletConnections =
	createSelector(
		document,
		d => d.outletConnections);

export const nodeOrder =
	createSelector(
		document,
		d => d.nodeOrder);

export const previewedParameterChanges =
	createSelector(
		app,
		app => app.previewedParameterChanges);

export const editHash =
	createSelector(
		document,
		document => document.editHash);

const nodes = createSelector(
	[document, previewedParameterChanges],
	(d, previewedParameterChanges) => mapValues(d.nodes, (node, nodeKey) => {
		const retval = {
			...node,
			parameters: {
				...node.parameters,
				...previewedParameterChanges[nodeKey]
			}
		};

		// Write uniforms to node from merged parameters.
		// TODO: There's probably a better place for this.
		const videoModule = Kit.moduleForNode(node);
		if (retval.details.nodeType === ModuleConfigurationType.shader) {
			if (videoModule.details.type !== ModuleConfigurationType.shader) {
				throw new Error("Mismatched node and module types");
			}

			retval.details.uniforms = {
				...retval.details.uniforms,
				...videoModule.details.parametersToUniforms(retval.parameters)
			};
		}

		return retval;
	}));

export const nextNodeKey =
	createSelector(
		document,
		d => (modType: Kit.ModuleType) => `${Kit.moduleForType(modType)!.name}-${d.nodeKeySeed}`);

export const orderedNodes: Selector<RootState, Array<{ key: string, node: VideoNode }>> =
	createSelector(
		[nodes, nodeOrder],
		(nodes: Record<string, VideoNode>, nodeOrder: string[]) => (
			nodeOrder.map(key => ({
				key,
				node: nodes[key]
			}))
		));

const inletOutletLinks: Selector<RootState, Array<{ inlet: Inlet, outlet: Outlet }>> = createSelector(
	[inletConnections, outletConnections],
	(
		inletConnections: { [nodeKey: string]: { [inletKey: string]: number } },
		outletConnections: { [nodeKey: string]: number }
	) => {
		const connectionsByBus: { [busIndex: number]: { inlets: Inlet[], outlets: Outlet[] } } = {};

		function initializeBusIndexIfNeeded(busIndex: number) {
			if (connectionsByBus[busIndex] == null) {
				connectionsByBus[busIndex] = {
					inlets: [],
					outlets: []
				};
			}
		}

		for (const nodeKey of Object.keys(outletConnections)) {
			const busIndex = outletConnections[nodeKey];
			initializeBusIndexIfNeeded(busIndex);
			connectionsByBus[busIndex].outlets
				.push({ nodeKey });
		}

		for (const nodeKey of Object.keys(inletConnections)) {
			for (const inletKey of Object.keys(inletConnections[nodeKey])) {
				let busIndex = inletConnections[nodeKey][inletKey];
				initializeBusIndexIfNeeded(busIndex);

				// If no outlet is connected to this bus, use the default constant bus.
				if (connectionsByBus[busIndex].outlets.length === 0) {
					busIndex = defaultConstantBusIndex;
				}

				connectionsByBus[busIndex].inlets
					.push({ nodeKey, inletKey });
			}
		}

		return flatMap(
			values(connectionsByBus),
			({ inlets, outlets }) => combinations(inlets, outlets))
			.map(([inlet, outlet]) => ({ inlet, outlet }));
	});


export const graph: Selector<RootState, SimpleVideoGraph> = createSelector(
	[
		orderedNodes,
		inletOutletLinks
	],
	(
		nodes: Array<{ key: string, node: VideoNode}>,
		inletOutletLinks: Array<{ inlet: Inlet, outlet: Outlet }>
	) => {
		let result = Graph.empty();
		result = nodes.reduce(
			(document, { key, node }) => Graph.insertNode(document, node, key),
			result);
		result = inletOutletLinks.reduce(
			(document, { inlet, outlet }) => Graph.insertEdge(
				document,
				{
					src: inlet.nodeKey,
					dst: outlet.nodeKey,
					metadata: { inlet: inlet.inletKey }
				},
				`${outlet.nodeKey} -> ${inlet.nodeKey}.${inlet.inletKey}`),
			result);
		return result;
	});

export const outputNodeKey =
	(state: RootState) => 'output';

