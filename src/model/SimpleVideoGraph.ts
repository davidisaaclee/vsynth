/*
 * Defines a plain-object representation of a video graph,
 * for use in a Redux store.
 */

import {
	entries, flatMap, isEqual, isEqualWith,
	after, memoize,
} from 'lodash';
import * as Graph from '@davidisaaclee/graph';
import {
	VideoGraph, 
	UniformValue,
	UniformSpecification
} from '@davidisaaclee/video-graph';
import * as Kit from './Kit';
import { Outlet } from './Outlet';
import { Inlet } from './Inlet';

export interface InletSpecification {
	inlet: string;
}

export type VideoNode = {
	parameters: Record<string, number>,
} & (
	({ nodeType: 'subgraph' } & SubgraphNode)
	| ({ nodeType: 'shader' } & ShaderNode)
);

export interface SubgraphNode {
	type: Kit.SubgraphModuleType;
	subgraph: SimpleVideoGraph;
	outputNodeKey: string;
}

export interface ShaderNode {
	type: Kit.ShaderModuleType;
	uniforms: Record<string, UniformValue>;
}


export type SimpleVideoGraph =
	Graph.Graph<VideoNode, InletSpecification>;

// TODO: It'd be nice to be able to automatically get this from a Graph<>.
export type Edge = Graph.Edge<InletSpecification>;


// -- Methods

export function videoModuleSpecFromModuleType(moduleType: Kit.ModuleType): VideoNode {
	const mod = Kit.moduleForType(moduleType);
	if (mod == null) {
		throw new Error("Invalid video module");
	}

	const parameters = mod.parameters.defaultValues;

	if (mod.details.type === 'shader') {
		const uniforms =
			mod.details.parametersToUniforms(parameters);
		return {
			nodeType: 'shader',
			type: moduleType as Kit.ShaderModuleType,
			parameters,
			uniforms
		};
	} else {
		const { graph: graphSpec, outputNodeKey } =
			mod.details.buildSubgraph();

		// Convert from specification (via module types) to real nodes.
		const subgraph =
			Graph.mapNodes(graphSpec, videoModuleSpecFromModuleType);

		return {
			nodeType: 'subgraph',
			type: moduleType as Kit.SubgraphModuleType,
			subgraph,
			outputNodeKey,
			parameters
		};
	}

}

// Holds all the necessary information to use a specific video module
// with a specific WebGL runtime.
export interface RuntimeModule {
	program: WebGLProgram;
}

function namespaceNodeKey(parentNodeKey: string, childNodeKey: string): string {
	return `${parentNodeKey}-${childNodeKey}`;
}

function flattenOutlet(
	outlet: Outlet,
	graph: SimpleVideoGraph
): Outlet {
	const node = Graph.nodeForKey(graph, outlet.nodeKey);

	if (node == null) {
		throw new Error('No such node');
	} 

	if (node.nodeType === 'shader') {
		return outlet;
	} else {
		const r = flattenOutlet({ nodeKey: node.outputNodeKey }, node.subgraph);
		return {
			...r,
			nodeKey: namespaceNodeKey(outlet.nodeKey, r.nodeKey)
		};
	}
}

function flattenInlet(
	inlet: Inlet,
	graph: SimpleVideoGraph
): Inlet[] {
	const node = Graph.nodeForKey(graph, inlet.nodeKey);

	if (node == null) {
		throw new Error('No such node');
	} 

	if (node.nodeType === 'shader') {
		return [inlet];
	} else {
		const videoModule = Kit.subgraphModules[node.type];
		const flattened = flatMap(
			videoModule.details.inletsToSubInlets[inlet.inletKey],
			subinlet => flattenInlet(subinlet, node.subgraph));

		return flattened.map(flattenedInlet => ({
			...flattenedInlet,
			nodeKey: namespaceNodeKey(inlet.nodeKey, flattenedInlet.nodeKey)
		}));
	}
}

// Converts each subgraph node to a set of connected shader nodes.
function flattenSimpleVideoGraph(graph: SimpleVideoGraph): SimpleVideoGraph {
	let result = Graph.empty;

	// Flatten and insert all nodes.
	result = entries(Graph.allNodes(graph)).reduce((acc, [nodeKey, node]) => {
		if (node.nodeType === 'shader') {
			return Graph.insertNode(acc, node, nodeKey);
		} else {
			const videoModule = Kit.subgraphModules[node.type];

			// Build dictionary of parameters to pass to children.
			const subparameters = videoModule.details.parametersToSubParameters(node.parameters);

			// Pass parameters to those children in the subgraph.
			// This happens before flattening the subgraph, so we can reference the children
			// by their non-namespaced keys.
			const subgraphWithUpdatedParameters = entries(subparameters).reduce(
				(subgraph, [nodeKey, paramsFromParent]) => (
					Graph.mutateNode(subgraph, nodeKey, node => {
						const parameters = {
							...node.parameters,
							...paramsFromParent
						};

						if (node.nodeType === 'shader') {
							// TODO: This should probably be unified with non-subgraphs
							const uniforms = {
								...node.uniforms,
								...Kit.shaderModules[node.type].details.parametersToUniforms(parameters)
							};

							return {
								...node,
								parameters,
								uniforms
							};
						} else {
							return {
								...node,
								parameters,
							};
						}
					})
				),
				node.subgraph);

			// Recursively flatten the subgraph.
			const flattenedSubgraph =
				flattenSimpleVideoGraph(subgraphWithUpdatedParameters);

			// Namespace the resulting flattened graph under this subgraph node's key,
			// and merge it into the accumulating graph.
			return Graph.merge(
				acc,
				transformAllGraphKeys(
					flattenedSubgraph,
					subgraphNodeKey => namespaceNodeKey(nodeKey, subgraphNodeKey)));
		}
	}, result);

	// Flatten and insert all top-level edges.
	result = entries(Graph.allEdges(graph)).reduce((acc, [edgeKey, edge]) => {
		const flattenedOutlet =
			flattenOutlet({ nodeKey: edge.dst }, graph);
		const flattenedInlets =
			flattenInlet({ nodeKey: edge.src, inletKey: edge.metadata.inlet }, graph);
		
		return flattenedInlets.reduce(
			(acc, flattenedInlet, i) => Graph.insertEdge(
				acc,
				{
					src: flattenedInlet.nodeKey,
					dst: flattenedOutlet.nodeKey,
					metadata: {
						inlet: flattenedInlet.inletKey
					},
				},
				// TODO: Edge keys don't really matter right now, as long as they are unique.
				// It'd probably be good to be more explicit about how they're being
				// disambiguated here, though.
				`${edgeKey}-${i}`),
			acc);
	}, result);

	return result;
}

function transformAllGraphKeys<N, E>(
	graph: Graph.Graph<N, E>,
	transformKey: (key: string) => string
): Graph.Graph<N, E> {
	return Graph.transformEdgeKeys(
		Graph.transformNodeKeys(
			graph,
			transformKey),
		transformKey);
}


function _videoGraphFromFlattenedVideoGraph(
	flattenedGraph: SimpleVideoGraph,
	// moduleKey :: ModuleType
	runtime: Record<Kit.ShaderModuleType, RuntimeModule>,
	frameIndex: number,
	gl: WebGLRenderingContext
): VideoGraph {
	const result = entries(Graph.allNodes(flattenedGraph)).reduce((result, [nodeKey, node]) => {
		const runtimeModule = runtime[node.type];
		const videoModule = Kit.moduleForNode(node);

		if (runtimeModule == null) {
			throw new Error(`No runtime found for module type: ${node.type}`);
		}
		if (videoModule == null) {
			throw new Error(`No module configuration found for module type: ${node.type}`);
		}

		if (videoModule.details.type !== 'shader') {
			throw new Error("Attempted to render a non-flattened graph.");
		}

		if (node.nodeType !== 'shader') {
			throw new Error("Mismatched node and module types");
		}

		return Graph.insertNode(result, {
			program: runtimeModule.program,
			uniforms: {
				...uniformValuesToSpec(videoModule.details.defaultUniforms(gl)),
				...uniformValuesToSpec(node.uniforms),
			}
		}, nodeKey);
	}, Graph.empty);

	return entries(Graph.allEdges(flattenedGraph)).reduce((result, [edgeKey, edge]) => {
		const { src: inletNodeKey, dst: outletNodeKey, metadata: inletSpec } = edge;
		const inletNode = Graph.nodeForKey(flattenedGraph, inletNodeKey)!;
		const videoModule = Kit.moduleForNode(inletNode);

		if (videoModule == null) {
			throw new Error(`No module configuration found for module type: ${Graph.nodeForKey(flattenedGraph, inletNodeKey)!.type}`);
		}

		if (videoModule.details.type !== 'shader') {
			throw new Error("Attempted to render a non-flattened graph.");
		}

		return Graph.insertEdge(result, {
			src: inletNodeKey,
			dst: outletNodeKey,
			metadata: {
				uniformIdentifier: videoModule.details.inletsToUniforms[inletSpec.inlet]
			}
		}, edgeKey);
	}, result);
}

const videoGraphFromFlattenedVideoGraph =
	memoize(_videoGraphFromFlattenedVideoGraph);

export function videoGraphFromSimpleVideoGraph(
	graph: SimpleVideoGraph,
	// moduleKey :: ModuleType
	runtime: Record<Kit.ShaderModuleType, RuntimeModule>,
	frameIndex: number,
	gl: WebGLRenderingContext
): VideoGraph {
	return videoGraphFromFlattenedVideoGraph(
		flattenSimpleVideoGraph(graph),
		runtime,
		frameIndex,
		gl);
}

function uniformValuesToSpec(
	valuesDict: { [identifier: string]: UniformValue }
): { [identifier: string]: UniformSpecification } {
	const retval = {};
	for (const identifier of Object.keys(valuesDict)) {
		retval[identifier] = { identifier, value: valuesDict[identifier] };
	}
	return retval;
}

function areNodesEqual(leftNode: VideoNode, rightNode: VideoNode): boolean {
	return isEqual(leftNode, rightNode);
}

function areEdgesEqual(leftEdge: InletSpecification, rightEdge: InletSpecification): boolean {
	return isEqual(leftEdge, rightEdge);
}

export function areGraphsEqual(leftGraph: SimpleVideoGraph, rightGraph: SimpleVideoGraph): boolean {
	// this business with `after` is to get `isEqualWith` to work how I'd expect it to work.
	// see this issue: https://github.com/lodash/lodash/issues/2490
	return isEqualWith(
		Graph.allNodes(leftGraph),
		Graph.allNodes(rightGraph),
		after(2, areNodesEqual))
		&& isEqualWith(
			Graph.allEdges(leftGraph),
			Graph.allEdges(rightGraph),
			after(2, areEdgesEqual));

}

