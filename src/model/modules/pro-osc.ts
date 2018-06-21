
import { UniformValue } from '@davidisaaclee/video-graph';
import { VideoModule } from '../VideoModule';
import { VideoNode } from '../SimpleVideoGraph';
import shaderSource from '../../shaders/pro-osc';

const parameterKeys = {
	baseFrequency: 'baseFrequency',
	fineFrequency: 'fineFrequency',
	red: 'red',
	green: 'green',
	blue: 'blue',
	shape: 'shape',
	phaseOffsetAmount: 'phase offset amount',
};

const stateKeys = {
	phaseOffset: 'phaseOffset',
	frameIndex: 'frameIndex',
};

export const proOsc: VideoModule = {
	shaderSource,
	parameters: {
		specifications: {
			[parameterKeys.baseFrequency]: {
				initialValue: () => Math.random(),
			},
			[parameterKeys.fineFrequency]: {
				initialValue: () => 0.5,
			},
			[parameterKeys.red]: {
				initialValue: () => 1,
			},
			[parameterKeys.green]: {
				initialValue: () => 0,
			},
			[parameterKeys.blue]: {
				initialValue: () => 0,
			},
			[parameterKeys.shape]: {
				initialValue: () => 0,
			},
			[parameterKeys.phaseOffsetAmount]: {
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
				})(values[parameterKeys.baseFrequency], values[parameterKeys.fineFrequency])
			},
			shape: {
				type: 'f',
				data: values[parameterKeys.shape]
			},
			phaseOffsetTextureAmount: {
				type: 'f',
				data: values[parameterKeys.phaseOffsetAmount]
			},
			color: {
				type: '3f',
				data: [
					values[parameterKeys.red],
					values[parameterKeys.green],
					values[parameterKeys.blue],
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
				data: node.state[stateKeys.phaseOffset] || 0
			}
		};
	},
	update: (frameIndex: number, state: Record<string, number>, node: VideoNode) => {
		const previousFrameIndex = state[stateKeys.frameIndex];
		const previousPhaseOffset = state[stateKeys.phaseOffset];
		const frequencyUniform = node.uniforms.frequency;

		if (previousFrameIndex == null || previousPhaseOffset == null || frequencyUniform == null) {
			return {
				[stateKeys.frameIndex]: frameIndex,
				[stateKeys.phaseOffset]: 0
			};
		}

		// frequency is multiplied by 2pi inside shader;
		// period = (2pi / (freq * 2pi)) = 1 / freq
		const period = 1 / (frequencyUniform.data as number);

		const frameDelta = frameIndex - previousFrameIndex;
		const phaseDelta = frameDelta / period;

		return {
			[stateKeys.frameIndex]: frameIndex,
			[stateKeys.phaseOffset]: (previousPhaseOffset + phaseDelta) % 1
		};
	},
	inlets: {
		uniformMappings: {
			'phase offset': 'phaseOffsetTexture',
			'input': 'pixelVariable',
		},
		displayOrder: ['input', 'phase offset'],
	}
}
