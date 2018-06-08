import { mapValues } from 'lodash';
import {
	VideoGraph, PluginNode, PluginConnection,
	UniformValue, UniformSpecification
} from '@davidisaaclee/video-graph';
import { mapNodes, mapEdges, nodeForKey } from '@davidisaaclee/graph';
import oscillatorShader from '../shaders/oscillator';
import constantShader from '../shaders/constant';
import {
	SimpleVideoGraph, VideoModuleSpecification, InletSpecification, ModuleType
} from './SimpleVideoGraph';

/*
 * A non-texture-based parameter to a module, which can be translated to a
 * set of uniforms to be provided to the fragment shader.
 */
export interface Parameter {
	initialValue(): number;
	toUniforms(value: number): { [identifier: string]: UniformValue };
}

/*
 * Configurations of nodes to be instantiated in a VideoGraph.
 */
export interface VideoModule {
	type: ModuleType;
	shaderSource: string;
	parameters?: { [identifier: string]: Parameter };
	defaultUniforms?: (gl: WebGLRenderingContext) => { [identifier: string]: UniformValue };
	animationUniforms?: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }) => { [identifier: string]: UniformValue };
	// maps display name to uniform identifier
	inletUniforms?: { [displayName: string]: string };
}

// key :: ModuleType
export const modules: { [key: string]: VideoModule } = {
	'oscillator': {
		type: 'oscillator',
		shaderSource: oscillatorShader,
		parameters: {
			'frequency': {
				initialValue: () => Math.random(),
				toUniforms: (value: number) => ({
					'frequency': {
						type: 'f',
						data: (Math.pow(value, 3) * 100) + 0.01
					}
				}),
			},
			'red': {
				initialValue: () => 1,
				toUniforms: (value: number) => ({ 'red': { type: 'f', data: value } }),
			},
			'green': {
				initialValue: () => 0,
				toUniforms: (value: number) => ({ 'green': { type: 'f', data: value } }),
			},
			'blue': {
				initialValue: () => 0,
				toUniforms: (value: number) => ({ 'blue': { type: 'f', data: value } }),
			},
		},
		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
			'frequency': {
				type: 'f',
				data: Math.random() * 1
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
			'phase offset': 'phaseOffsetTexture',
		},
	},

	'constant': {
		type: 'constant',
		shaderSource: constantShader,
		parameters: {
			'value': {
				initialValue: () => Math.random(),
				toUniforms: (value: number) => ({
					'value': {
						type: '3f',
						data: [value, value, value]
					}
				}),
			}
		},
		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'value': {
				type: '3f',
				data: [0, 0, 0]
			}
		}),
	},
};

export function videoModuleSpecFromModule(mod: VideoModule): VideoModuleSpecification {
	return {
		type: mod.type,
		uniforms: {},
		parameters: mapValues(
			mod.parameters,
			param => param.initialValue())
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

		const parameterUniforms = moduleConfiguration.parameters == null
			? {}
			: Object.keys(moduleConfiguration.parameters)
				.map(paramKey => {
					if (moduleSpec.parameters[paramKey] == null) {
						throw new Error(`No value specified for parameter ${paramKey}`);
					}

					return moduleConfiguration.parameters![paramKey]
						.toUniforms(moduleSpec.parameters[paramKey]);
				})
				.reduce((acc, elm) => Object.assign(acc, elm), {});

		const animationUniforms = moduleConfiguration.animationUniforms == null
			? {} 
			: moduleConfiguration.animationUniforms(
				frameIndex, 
				{ ...defaultUniforms, ...moduleSpec.uniforms, ...parameterUniforms });

		return {
			program: runtimeModule.program,
			uniforms: {
				...uniformValuesToSpec(defaultUniforms),
				...uniformValuesToSpec(animationUniforms),
				...uniformValuesToSpec(parameterUniforms),
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

