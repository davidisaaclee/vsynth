import { VideoModule, ShaderModule, ModuleConfigurationType } from '../VideoModule';
import shaderSource from '../../shaders/oscillator.generated';

export const parameterKeys = {
	input: 'input',
	shape: 'shape',
	waveSizeAmount: 'harmonics amount',
	speedAmount: 'inharmonics amount',
	phaseOffsetAmount: 'phase offset amount',
};

export const inletKeys = {
	input: 'input',
	waveSize: 'harmonics',
	speed: 'inharmonics',
	shape: 'shape',
	rotation: 'rotation',
	phaseOffset: 'phase offset',
};

export const periodic: VideoModule<ShaderModule> = {
	name: 'periodic',

	description: "Applies a periodic function to its input.",

	parameters: {
		keys: Object.keys(parameterKeys),
		defaultValues: {
			[parameterKeys.input]: 1,
			[parameterKeys.waveSizeAmount]: 1,
			[parameterKeys.speedAmount]: 1,
			[parameterKeys.shape]: 0,
			[parameterKeys.phaseOffsetAmount]: 0,
		}
	},

	inlets: {
		keys: [
			inletKeys.input,
			inletKeys.waveSize,
			inletKeys.speed,
			inletKeys.shape,
			inletKeys.phaseOffset,
		],

		associatedParameters: {
			[inletKeys.input]: parameterKeys.input,
			[inletKeys.waveSize]: parameterKeys.waveSizeAmount,
			[inletKeys.speed]: parameterKeys.speedAmount,
			[inletKeys.shape]: parameterKeys.shape,
			[inletKeys.phaseOffset]: parameterKeys.phaseOffsetAmount,
		}
	},

	details: {
		type: ModuleConfigurationType.shader,

		shaderSource,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),

		parametersToUniforms: values => ({
			inputAmount: {
				type: 'f',
				data: values[parameterKeys.input]
			},
			waveSizeAmount: {
				type: 'f',
				data: values[parameterKeys.waveSizeAmount]
			},
			speedAmount: {
				type: 'f',
				data: values[parameterKeys.speedAmount]
			},
			shapeAmount: {
				type: 'f',
				data: values[parameterKeys.shape]
			},
			phaseOffsetTextureAmount: {
				type: 'f',
				data: values[parameterKeys.phaseOffsetAmount]
			},
		}),

		inletsToUniforms: {
			[inletKeys.input]: 'inputTexture',
			[inletKeys.waveSize]: 'waveSize',
			[inletKeys.speed]: 'speed',
			[inletKeys.shape]: 'shape',
			[inletKeys.phaseOffset]: 'phaseOffsetTexture',
		},
	}

};

