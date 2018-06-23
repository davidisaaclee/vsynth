/*
 * Defines a plain-object representation of a video graph,
 * for use in a Redux store.
 */

import { mapValues } from 'lodash';
import {
	Graph, Edge,
	mapNodes, mapEdges, nodeForKey
} from '@davidisaaclee/graph';
import {
	VideoGraph, PluginNode,
	PluginConnection, UniformValue,
	UniformSpecification
} from '@davidisaaclee/video-graph';
import { ModuleType, modules } from './Kit';

export interface InletSpecification {
	inlet: string;
}

type SubgraphModuleType = 'oscillator-subgraph';
type ShaderModuleType = 'oscillator';

export interface VideoNode {
	parameters: Record<string, number>;
}

export interface SubgraphNode extends VideoNode {
	type: SubgraphModuleType;
	subgraph: SimpleVideoGraph;
}

export interface ShaderNode extends VideoNode {
	type: ShaderModuleType;
	uniforms: Record<string, UniformValue>;
}


export type SimpleVideoGraph =
	Graph<VideoNode, InletSpecification>;

// TODO: It'd be nice to be able to automatically get this from a Graph<>.
export type Edge = Edge<InletSpecification>;


// -- Methods

export function videoModuleSpecFromModuleType(moduleType: ModuleType): VideoNode {
	const mod = modules[moduleType];
	if (mod == null) {
		throw new Error("Invalid video module");
	}

	const parameters = mod.parameters == null
		? {}
		: mapValues(
			mod.parameters.specifications,
			param => param.initialValue()
		);
	const uniforms = mod.parameters == null
		? {}
		: mod.parameters.toUniforms(parameters);

	return {
		type: moduleType,
		uniforms,
		parameters,
	};
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
	const mappedNodes = mapNodes(graph, (moduleSpec: VideoNode): PluginNode => {
		const runtimeModule = runtime[moduleSpec.type];
		const moduleConfiguration = modules[moduleSpec.type];

		if (runtimeModule == null) {
			throw new Error(`No runtime found for module type: ${moduleSpec.type}`);
		}
		if (moduleConfiguration == null) {
			throw new Error(`No module configuration found for module type: ${moduleSpec.type}`);
		}

		const defaultUniforms = moduleConfiguration.defaultUniforms == null
			? {} 
			: moduleConfiguration.defaultUniforms(gl);

		return {
			program: runtimeModule.program,
			uniforms: {
				...uniformValuesToSpec(defaultUniforms),
				...uniformValuesToSpec(moduleSpec.uniforms),
			}
		};
	});

	return mapEdges(
		mappedNodes,
		(inletSpec: InletSpecification, src: string, dst: string): PluginConnection => {
			const moduleConfiguration = modules[nodeForKey(graph, src)!.type];

			if (moduleConfiguration == null) {
				throw new Error(`No module configuration found for module type: ${nodeForKey(graph, src)!.type}`);
			}
			if (moduleConfiguration.inlets == null) {
				throw new Error("Edge connecting to node with no inlets");
			}

			return {
				uniformIdentifier: moduleConfiguration.inlets.uniformMappings[inletSpec.inlet]
			};
		});
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

