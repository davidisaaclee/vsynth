import { mapValues } from 'lodash';
import {
	VideoGraph, PluginNode, PluginConnection,
	UniformValue, UniformSpecification
} from '@davidisaaclee/video-graph';
import { mapNodes, mapEdges, nodeForKey } from '@davidisaaclee/graph';
import identityShader from '../shaders/identity';
import oscillatorShader from '../shaders/oscillator';
import constantShader from '../shaders/constant';
import mixerShader from '../shaders/mixer';
import {
	SimpleVideoGraph, VideoModuleSpecification, InletSpecification, ModuleType
} from './SimpleVideoGraph';

const k = {
	oscillator: {
		baseFrequency: 'baseFrequency',
		fineFrequency: 'fineFrequency',
		red: 'red',
		green: 'green',
		blue: 'blue',
		state: {
			phaseOffset: 'phaseOffset',
			frameIndex: 'frameIndex',
		}
	},
	constant: {
		value: 'value',
	},
	mixer: {
		mixAmount: 'mix amount',
	},
};

/*
 * A non-texture-based parameter to a module, which can be translated to a
 * set of uniforms to be provided to the fragment shader.
 */
export interface Parameter {
	initialValue(): number;
}

/*
 * Configurations of nodes to be instantiated in a VideoGraph.
 */
export interface VideoModule {
	type: ModuleType;
	shaderSource: string;
	parameters?: {
		specifications: { [identifier: string]: Parameter },
		toUniforms: (values: { [identifier: string]: number }) => { [identifier: string]: UniformValue }
	};
	defaultUniforms?: (gl: WebGLRenderingContext) => { [identifier: string]: UniformValue };
	animationUniforms?: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }, node: VideoModuleSpecification) => { [identifier: string]: UniformValue };

	// Update internal state on each frame if needed.
	update?: (frameIndex: number, state: Record<string, number>, node: VideoModuleSpecification) => Record<string, number>;

	inlets?: {
		// maps display name to uniform identifier
		uniformMappings: { [key: string]: string },

		// display order of inlets by key
		displayOrder: string[],
	}
}

// key :: ModuleType
export const modules: { [key: string]: VideoModule } = {
	'identity': {
		type: 'identity',
		shaderSource: identityShader,
		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),
		inlets: {
			uniformMappings: {
				'input': 'inputTexture',
			},
			displayOrder: ['input'],
		}
	},
	'oscillator': {
		type: 'oscillator',
		shaderSource: oscillatorShader,
		parameters: {
			specifications: {
				[k.oscillator.baseFrequency]: {
					initialValue: () => Math.random(),
				},
				[k.oscillator.fineFrequency]: {
					initialValue: () => 0.5,
				},
				[k.oscillator.red]: {
					initialValue: () => 1,
				},
				[k.oscillator.green]: {
					initialValue: () => 0,
				},
				[k.oscillator.blue]: {
					initialValue: () => 0,
				},
			},
			toUniforms: values => ({
				frequency: {
					type: 'f',
					data: ((baseFreq, fineFreq) => {
						const factor = Math.ceil(Math.pow(baseFreq, 2) * 100);
						const offsettingScaleFactor = 2 * (fineFreq - 0.5);

						return offsettingScaleFactor + factor;
					})(values[k.oscillator.baseFrequency], values[k.oscillator.fineFrequency])
				},
				color: {
					type: '3f',
					data: [
						values[k.oscillator.red],
						values[k.oscillator.green],
						values[k.oscillator.blue],
					]
				},
			}),
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
		animationUniforms: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }, node: VideoModuleSpecification) => {
			return {
				'phaseOffset': {
					type: 'f',
					// TODO: be safer
					data: node.state[k.oscillator.state.phaseOffset] || 0
				}
			};
		},
		update: (frameIndex: number, state: Record<string, number>, node: VideoModuleSpecification) => {
			const previousFrameIndex = state[k.oscillator.state.frameIndex];
			const previousPhaseOffset = state[k.oscillator.state.phaseOffset];
			const frequencyUniform = node.uniforms.frequency;

			if (previousFrameIndex == null || previousPhaseOffset == null || frequencyUniform == null) {
				return {
					[k.oscillator.state.frameIndex]: frameIndex,
					[k.oscillator.state.phaseOffset]: 0
				};
			}

			// frequency is multiplied by 2pi inside shader;
			// period = (2pi / (freq * 2pi)) = 1 / freq
			const period = 1 / (frequencyUniform.data as number);

			const frameDelta = frameIndex - previousFrameIndex;
			const phaseDelta = frameDelta / period;

			return {
				[k.oscillator.state.frameIndex]: frameIndex,
				[k.oscillator.state.phaseOffset]: (previousPhaseOffset + phaseDelta) % 1
			};
		},
		inlets: {
			uniformMappings: {
				'rotation': 'rotationTheta',
				'phase offset': 'phaseOffsetTexture',
			},
			displayOrder: ['rotation', 'phase offset'],
		}
	},

	'constant': {
		type: 'constant',
		shaderSource: constantShader,
		parameters: {
			specifications: {
				[k.constant.value]: {
					initialValue: () => 0,
				}
			},
			toUniforms: values => ({
				'value': {
					type: '3f',
					data: [values[k.constant.value], values[k.constant.value], values[k.constant.value]]
				}
			})
		},
	},

	'mixer': {
		type: 'mixer',
		shaderSource: mixerShader,
		parameters: {
			specifications: {
				[k.mixer.mixAmount]: {
					initialValue: () => 0.5,
				}
			},
			toUniforms: values => ({
				'mixAmount': {
					type: 'f',
					data: values[k.mixer.mixAmount]
				}
			})
		},
		inlets: {
			uniformMappings: {
				'a': 'inputA',
				'b': 'inputB',
			},
			displayOrder: ['a', 'b']
		}
	},
};

export function videoModuleSpecFromModule(mod: VideoModule): VideoModuleSpecification {
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
		type: mod.type,
		uniforms,
		parameters,
		state: {}
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

		const animationUniforms = moduleConfiguration.animationUniforms == null
			? {} 
			: moduleConfiguration.animationUniforms(
				frameIndex, 
				{
					...defaultUniforms,
					...moduleSpec.uniforms,
				},
				moduleSpec);

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

