import { UniformValue } from '@davidisaaclee/video-graph';
import { VideoModule } from '../VideoModule';
import { VideoNode } from '../SimpleVideoGraph';
import shaderSource from '../../shaders/oscillator.generated';

const parameterKeys = {
	red: 'red',
	green: 'green',
	blue: 'blue',
	shape: 'shape',
	waveSizeAmount: 'wave size amount',
	speedAmount: 'speed amount',
	rotationAmount: 'rotation amount',
	phaseOffsetAmount: 'phase offset amount',
};

const stateKeys = {
	phaseOffset: 'phaseOffset',
	frameIndex: 'frameIndex',
};

export const oscillator: VideoModule = {
	shaderSource,
	parameters: {
		specifications: {
			[parameterKeys.waveSizeAmount]: {
				initialValue: () => 0.5,
			},
			[parameterKeys.speedAmount]: {
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
			[parameterKeys.rotationAmount]: {
				initialValue: () => 0,
			},
			[parameterKeys.phaseOffsetAmount]: {
				initialValue: () => 0,
			},
		},
		toUniforms: values => ({
			waveSizeAmount: {
				type: 'f',
				data: values[parameterKeys.waveSizeAmount]
			},
			speedAmount: {
				type: 'f',
				data: values[parameterKeys.speedAmount]
			},
			shape: {
				type: 'f',
				data: values[parameterKeys.shape]
			},
			rotationAmount: {
				type: 'f',
				data: values[parameterKeys.rotationAmount]
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

		// TODO: There's no longer a scalar frequency uniform.

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
			'waveSize': 'waveSize',
			'speed': 'speed',
			'rotation': 'rotationTheta',
			'phase offset': 'phaseOffsetTexture',
		},
		displayOrder: [
			'waveSize',
			'speed',
			'rotation',
			'phase offset',
		],
		associatedParameters: {
			'waveSize': [parameterKeys.waveSizeAmount],
			'speed': [parameterKeys.speedAmount],
			'rotation': [parameterKeys.rotationAmount],
			'phase offset': [parameterKeys.phaseOffsetAmount],
		}
	}
}
