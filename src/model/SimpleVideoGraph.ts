/*
 * Defines a plain-object representation of a video graph,
 * for use in a Redux store.
 */

import {
	entries, flatMap, isEqual, isEqualWith,
	after, memoize
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
import { RuntimeModule } from './RuntimeModule';
import { ModuleConfigurationType } from './VideoModule';

export interface InletSpecification {
	inlet: string;
}

export interface VideoNode {
	parameters: Record<string, number>;
	details: SubgraphNode | ShaderNode;
}

export interface SubgraphNode {
	nodeType: ModuleConfigurationType.subgraph;
	type: Kit.SubgraphModuleType;
	subgraph: SimpleVideoGraph;
	outputNodeKey: string;
}

export interface ShaderNode {
	nodeType: ModuleConfigurationType.shader;
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

	if (mod.details.type === ModuleConfigurationType.shader) {
		const uniforms =
			mod.details.parametersToUniforms(parameters);
		return {
			parameters,
			details: {
				nodeType: ModuleConfigurationType.shader,
				type: moduleType as Kit.ShaderModuleType,
				uniforms
			}
		};
	} else {
		const { graph: graphSpec, outputNodeKey } =
			mod.details.buildSubgraph();

		// Type assertion to widen node type of `graphSpec` to both VideoNode and ModuleType.
		// This enables reusing the `graphSpec` "box" in `mapNodes`.
		const typeWidenedGraphSpec: Graph.Graph<VideoNode | Kit.ModuleType, InletSpecification> = graphSpec;
		const outputSubgraph = typeWidenedGraphSpec as SimpleVideoGraph;

		// Convert from specification (via module types) to real nodes.
		Graph.mapNodes(
			graphSpec,
			outputSubgraph,
			videoModuleSpecFromModuleType);

		return {
			parameters,
			details: {
				nodeType: ModuleConfigurationType.subgraph,
				type: moduleType as Kit.SubgraphModuleType,
				subgraph: outputSubgraph,
				outputNodeKey,
			}
		};
	}

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

	if (node.details.nodeType === ModuleConfigurationType.shader) {
		return outlet;
	} else {
		const r = flattenOutlet({ nodeKey: node.details.outputNodeKey }, node.details.subgraph);
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

	if (node.details.nodeType === ModuleConfigurationType.shader) {
		return [inlet];
	} else if (node.details.nodeType === ModuleConfigurationType.subgraph) {
		const subgraphDetails: SubgraphNode = node.details;
		const videoModule = Kit.subgraphModules[subgraphDetails.type];
		const flattened = flatMap(
			videoModule.details.inletsToSubInlets[inlet.inletKey],
			subinlet => flattenInlet(subinlet, subgraphDetails.subgraph));

		return flattened.map(flattenedInlet => ({
			...flattenedInlet,
			nodeKey: namespaceNodeKey(inlet.nodeKey, flattenedInlet.nodeKey)
		}));
	} else {
		// TODO: This is because of the way that the tagged union works :(
		throw new Error("Invalid node type");
	}
}

const shouldMemoizeGraphConversion = false;

// Converts each subgraph node to a set of connected shader nodes.
function _flattenSimpleVideoGraph(graph: SimpleVideoGraph, editHash: string): SimpleVideoGraph {
	let result = Graph.empty();

	// Flatten and insert all nodes.
	result = entries(Graph.allNodes(graph)).reduce((acc, [nodeKey, node]) => {
		if (node.details.nodeType === ModuleConfigurationType.shader) {
			return Graph.insertNode(acc, node, nodeKey);
		} else {
			const videoModule = Kit.subgraphModules[node.details.type];

			// Build dictionary of parameters to pass to children.
			const subparameters = videoModule.details.parametersToSubParameters(node.parameters);

			// Pass parameters to those children in the subgraph.
			// This happens before flattening the subgraph, so we can reference the children
			// by their non-namespaced keys.
			const subgraphWithUpdatedParameters = entries(subparameters).reduce(
				(subgraph, [nodeKey, paramsFromParent]) => (
					Graph.mutateNode(subgraph, nodeKey, (node): VideoNode => {
						const parameters = {
							...node.parameters,
							...paramsFromParent
						};

						if (node.details.nodeType === ModuleConfigurationType.shader) {
							// TODO: This should probably be unified with non-subgraphs
							const uniforms = {
								...node.details.uniforms,
								...Kit.shaderModules[node.details.type].details.parametersToUniforms(parameters)
							};

							return {
								...node,
								parameters,
								details: {
									...node.details,
									uniforms,
								}
							};
						} else {
							return {
								...node,
								parameters,
							};
						}
					})
				),
				node.details.subgraph);

			// Recursively flatten the subgraph.
			const flattenedSubgraph =
				_flattenSimpleVideoGraph(subgraphWithUpdatedParameters, editHash);

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

const flattenSimpleVideoGraph =
	shouldMemoizeGraphConversion
	? memoize(_flattenSimpleVideoGraph, (_, editHash) => editHash)
	: _flattenSimpleVideoGraph;

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
	editHash: string,
	runtime: Record<Kit.ShaderModuleType, RuntimeModule>,
	gl: WebGLRenderingContext
): VideoGraph {
	const result = entries(Graph.allNodes(flattenedGraph)).reduce((result, [nodeKey, node]) => {
		const runtimeModule = runtime[node.details.type];
		const videoModule = Kit.moduleForNode(node);

		if (runtimeModule == null) {
			throw new Error(`No runtime found for module type: ${node.details.type}`);
		}
		if (videoModule == null) {
			throw new Error(`No module configuration found for module type: ${node.details.type}`);
		}

		if (videoModule.details.type !== ModuleConfigurationType.shader) {
			throw new Error("Attempted to render a non-flattened graph.");
		}

		if (node.details.nodeType !== ModuleConfigurationType.shader) {
			throw new Error("Mismatched node and module types");
		}

		return Graph.insertNode(result, {
			...runtimeModule,
			uniforms: {
				...uniformValuesToSpec(videoModule.details.defaultUniforms(gl)),
				...uniformValuesToSpec(node.details.uniforms),
			},
		}, nodeKey);
	}, Graph.empty());

	const retval = entries(Graph.allEdges(flattenedGraph)).reduce((result, [edgeKey, edge]) => {
		const { src: inletNodeKey, dst: outletNodeKey, metadata: inletSpec } = edge;
		const inletNode = Graph.nodeForKey(flattenedGraph, inletNodeKey)!;
		const videoModule = Kit.moduleForNode(inletNode);

		if (videoModule == null) {
			throw new Error(`No module configuration found for module type: ${Graph.nodeForKey(flattenedGraph, inletNodeKey)!.details.type}`);
		}

		if (videoModule.details.type !== ModuleConfigurationType.shader) {
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

	return retval;
}

const videoGraphFromFlattenedVideoGraph =
	shouldMemoizeGraphConversion
	? memoize(_videoGraphFromFlattenedVideoGraph, (_, editHash) => editHash)
	: _videoGraphFromFlattenedVideoGraph;

export function videoGraphFromSimpleVideoGraph(
	graph: SimpleVideoGraph,
	editHash: string,
	// moduleKey :: ModuleType
	runtime: Record<Kit.ShaderModuleType, RuntimeModule>,
	gl: WebGLRenderingContext
): VideoGraph {
	const retval = videoGraphFromFlattenedVideoGraph(
		flattenSimpleVideoGraph(Graph.clone(graph), editHash),
		editHash,
		runtime,
		gl);
	return retval;
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

