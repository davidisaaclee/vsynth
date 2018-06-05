import {
	VideoGraph, PluginNode, PluginConnection,
	UniformValue, UniformSpecification
} from '@davidisaaclee/video-graph';
import { mapNodes, mapEdges } from '@davidisaaclee/graph';
import oscillatorShader from '../shaders/oscillator';
import constantShader from '../shaders/constant';
import {
	SimpleVideoGraph, VideoModuleSpecification, InletSpecification
} from './SimpleVideoGraph';

export interface VideoModule {
	shaderSource: string;
	defaultUniforms?: (gl: WebGLRenderingContext) => { [identifier: string]: UniformValue };
	animationUniforms?: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }) => { [identifier: string]: UniformValue };
	// maps display name to uniform identifier
	inletUniforms?: { [displayName: string]: string };
}

// key :: ModuleType
export const modules: { [key: string]: VideoModule } = {
	'oscillator': {
		shaderSource: oscillatorShader,
		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			}
		}),
		animationUniforms: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }) => ({
			'phaseOffset': {
				type: 'f',
				// TODO: be safer
				data: (frameIndex * 2 * Math.PI / (uniforms.frequency.data as number)) % 1,
			}
		}),
		inletUniforms: {
			'rotation': 'rotationTheta',
		},
	},

	'constant': {
		shaderSource: constantShader,
		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'value': {
				type: '3f',
				data: [0, 0, 0]
			}
		}),
	},
};


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
	const mappedNodes = mapNodes(graph, (moduleSpec: VideoModuleSpecification): PluginNode => {
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

		const animationUniforms = moduleConfiguration.animationUniforms == null
			? {} 
			: moduleConfiguration.animationUniforms(
				frameIndex, 
				{ ...defaultUniforms, ...moduleSpec.uniforms });

		return {
			program: runtimeModule.program,
			uniforms: {
				...uniformValuesToSpec(defaultUniforms),
				...uniformValuesToSpec(animationUniforms),
				...uniformValuesToSpec(moduleSpec.uniforms),
			}
		};
	});

	return mapEdges(
		mappedNodes,
		(inletSpec: InletSpecification, src: string, dst: string): PluginConnection => {
			const moduleConfiguration = modules[graph.nodes[src].type];

			if (moduleConfiguration == null) {
				throw new Error(`No module configuration found for module type: ${graph.nodes[src].type}`);
			}
			if (moduleConfiguration.inletUniforms == null) {
				throw new Error("Edge connecting to node with no inlets");
			}

			return {
				uniformIdentifier: moduleConfiguration.inletUniforms[inletSpec.inlet]
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

