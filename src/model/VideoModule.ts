import { Graph } from '@davidisaaclee/graph';
import { UniformValue } from '@davidisaaclee/video-graph';
import { Inlet } from './Inlet';
import { InletSpecification } from './SimpleVideoGraph';
import { ModuleType } from './Kit';

export enum ModuleConfigurationType {
	subgraph = 'subgraph',
	shader = 'shader',
}

export type VideoModuleDetails = SubgraphModule | ShaderModule;

/*
 * Configurations of nodes to be instantiated in a VideoGraph.
 */
export interface VideoModule<Details extends VideoModuleDetails> {
	// A short, human-readable name for this module.
	name: string;

	// A human-readable description of what this module does.
	description: string;

	parameters: {
		keys: string[],
		defaultValues: Record<string, number>,
	};

	inlets: {
		keys: string[],

		// Maps inlet keys to associated parameter keys.
		associatedParameters: Record<string, string>,
	};

	details: Details;
}


export interface SubgraphModule {
	type: ModuleConfigurationType.subgraph;

	// Maps a set of parameters from an instance of this module to a mapping from subnode key to a parameter set for that subnode
	// :: Record<ParamKey, ParamValue> -> Record<NodeKey, Record<ParamKey, ParamValue>>
	parametersToSubParameters: (params: Record<string, number>) => Record<string, Record<string, number>>;
	
	// Maps each inlet to a set of subinlets
	// :: { [ownInlet: InletKey]: Inlet[] }
	inletsToSubInlets: Record<string, Inlet[]>;

	// TODO: This is confusingly-named: it's building a specification for a subgraph...
	buildSubgraph: () => { graph: Graph<ModuleType, InletSpecification>, outputNodeKey: string };
}

export interface ShaderModule {
	type: ModuleConfigurationType.shader;

	shaderSource: string;

	// :: WebGLRenderingContext -> Record<UniformKey, UniformValue>;
	defaultUniforms: (gl: WebGLRenderingContext) => Record<string, UniformValue>;

	// :: Record<ParamKey, ParamValue> -> Record<UniformKey, UniformValue>
	parametersToUniforms: (params: Record<string, number>) => Record<string, UniformValue>;

	// :: Record<InletKey, UniformKey>
	inletsToUniforms: Record<string, string>;
}

