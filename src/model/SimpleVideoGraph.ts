/*
 * Defines a plain-object representation of a video graph,
 * for use in a Redux store.
 */

import {
	Graph, Edge,
	mapNodes, mapEdges, nodeForKey
} from '@davidisaaclee/graph';
import {
	VideoGraph, PluginNode,
	PluginConnection, UniformValue,
	UniformSpecification
} from '@davidisaaclee/video-graph';
import * as Kit from './Kit';

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
}

export interface ShaderNode {
	type: Kit.ShaderModuleType;
	uniforms: Record<string, UniformValue>;
}


export type SimpleVideoGraph =
	Graph<VideoNode, InletSpecification>;

// TODO: It'd be nice to be able to automatically get this from a Graph<>.
export type Edge = Edge<InletSpecification>;


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
			type: moduleType,
			parameters,
			uniforms
		};
	} else {
		throw new Error("TODO");
	}

}

// Holds all the necessary information to use a specific video module
// with a specific WebGL runtime.
export interface RuntimeModule {
	program: WebGLProgram;
}

export function videoGraphFromSimpleVideoGraph(
	graph: SimpleVideoGraph,
	// moduleKey :: ModuleType
	runtime: { [moduleKey: string]: RuntimeModule },
	frameIndex: number,
	gl: WebGLRenderingContext
): VideoGraph {
	const mappedNodes = mapNodes(graph, (node: VideoNode): PluginNode => {
		const runtimeModule = runtime[node.type];
		const videoModule = Kit.moduleForNode(node);

		if (runtimeModule == null) {
			throw new Error(`No runtime found for module type: ${node.type}`);
		}
		if (videoModule == null) {
			throw new Error(`No module configuration found for module type: ${node.type}`);
		}

		if (videoModule.details.type === 'shader') {
			if (node.nodeType !== 'shader') {
				throw new Error("Mismatched node and module types");
			}

			return {
				program: runtimeModule.program,
				uniforms: {
					...uniformValuesToSpec(videoModule.details.defaultUniforms(gl)),
					...uniformValuesToSpec(node.uniforms),
				}
			};
		} else {
			throw new Error('TODO');
		}
	});

	const videoGraph = mapEdges(
		mappedNodes,
		(inletSpec: InletSpecification, inletNodeKey: string, outletNodeKey: string): PluginConnection => {
			const inletNode = nodeForKey(graph, inletNodeKey)!;
			const videoModule = Kit.moduleForNode(inletNode);

			if (videoModule == null) {
				throw new Error(`No module configuration found for module type: ${nodeForKey(graph, inletNodeKey)!.type}`);
			}
			if (videoModule.inlets == null) {
				throw new Error("Edge connecting to node with no inlets");
			}
			
			if (videoModule.details.type === 'shader') {
				return {
					uniformIdentifier: videoModule.details.inletsToUniforms[inletSpec.inlet]
				};
			} else {
				throw new Error("TODO");
			}
		});

	return videoGraph;
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

