import { UniformValue } from '@davidisaaclee/video-graph';
import identityShader from '../shaders/identity';
import oscillatorShader from '../shaders/oscillator.generated';
import proOscShader from '../shaders/pro-osc';
import constantShader from '../shaders/constant';
import mixerShader from '../shaders/mixer';
import scanlinesShader from '../shaders/scanlines';
import { crosshatch } from './modules/crosshatch';
import { dither } from './modules/dither';
import { rgbOffset } from './modules/rgbOffset';
import { VideoNode } from './SimpleVideoGraph';
import { VideoModule } from './VideoModule';

// TODO: Would be nice to make this typesafe with Kit.modules
export type ModuleType =
	"identity" | "oscillator" | "constant" | "mixer" | "scanlines"
	| "pro-osc" | "crosshatch" | "dither" | "rgbOffset";

const k = {
	oscillator: {
		baseFrequency: 'baseFrequency',
		fineFrequency: 'fineFrequency',
		red: 'red',
		green: 'green',
		blue: 'blue',
		shape: 'shape',
		rotationAmount: 'rotation amount',
		phaseOffsetAmount: 'phase offset amount',
		state: {
			phaseOffset: 'phaseOffset',
			frameIndex: 'frameIndex',
		}
	},
	proOsc: {
		baseFrequency: 'baseFrequency',
		fineFrequency: 'fineFrequency',
		red: 'red',
		green: 'green',
		blue: 'blue',
		shape: 'shape',
		phaseOffsetAmount: 'phase offset amount',
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
	scanlines: {
		ditherAmount: 'dither amount',
		rotationAmount: 'rotation amount',
		phaseOffsetAmount: 'phase offset amount',
	},
};


// key :: ModuleType
export const modules: Record<ModuleType, VideoModule> = {
	rgbOffset,
	dither,
	crosshatch,
	'identity': {
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
				[k.oscillator.shape]: {
					initialValue: () => 0,
				},
				[k.oscillator.rotationAmount]: {
					initialValue: () => 0,
				},
				[k.oscillator.phaseOffsetAmount]: {
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
				shape: {
					type: 'f',
					data: values[k.oscillator.shape]
				},
				rotationAmount: {
					type: 'f',
					data: values[k.oscillator.rotationAmount]
				},
				phaseOffsetTextureAmount: {
					type: 'f',
					data: values[k.oscillator.phaseOffsetAmount]
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
		animationUniforms: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }, node: VideoNode) => {
			return {
				'phaseOffset': {
					type: 'f',
					// TODO: be safer
					data: node.state[k.oscillator.state.phaseOffset] || 0
				}
			};
		},
		update: (frameIndex: number, state: Record<string, number>, node: VideoNode) => {
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
	
	'pro-osc': {
		shaderSource: proOscShader,
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
				[k.oscillator.shape]: {
					initialValue: () => 0,
				},
				[k.oscillator.phaseOffsetAmount]: {
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
				shape: {
					type: 'f',
					data: values[k.oscillator.shape]
				},
				phaseOffsetTextureAmount: {
					type: 'f',
					data: values[k.oscillator.phaseOffsetAmount]
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
		animationUniforms: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }, node: VideoNode) => {
			return {
				'phaseOffset': {
					type: 'f',
					// TODO: be safer
					data: node.state[k.oscillator.state.phaseOffset] || 0
				}
			};
		},
		update: (frameIndex: number, state: Record<string, number>, node: VideoNode) => {
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
				'phase offset': 'phaseOffsetTexture',
				'input': 'pixelVariable',
			},
			displayOrder: ['input', 'phase offset'],
		}
	},

	'constant': {
		shaderSource: constantShader,
		parameters: {
			specifications: {
				[k.constant.value]: {
					initialValue: () => 1,
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

	'scanlines': {
		shaderSource: scanlinesShader,
		parameters: {
			specifications: {
				[k.scanlines.rotationAmount]: {
					initialValue: () => 0,
				},
				[k.scanlines.phaseOffsetAmount]: {
					initialValue: () => 0,
				},
				[k.scanlines.ditherAmount]: {
					initialValue: () => 0,
				},
			},
			toUniforms: values => ({
				rotationAmount: {
					type: 'f',
					data: values[k.scanlines.rotationAmount]
				},
				phaseOffsetTextureAmount: {
					type: 'f',
					data: values[k.scanlines.phaseOffsetAmount]
				},
				'ditherAmount': {
					type: 'f',
					data: values[k.scanlines.ditherAmount]
				},
			})
		},
		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),
		inlets: {
			uniformMappings: {
				'rotation': 'rotationTheta',
				'phase offset': 'phaseOffsetTexture',
			},
			displayOrder: ['rotation', 'phase offset'],
		}
	},
};

