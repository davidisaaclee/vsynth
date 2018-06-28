import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/oscillator.generated';

export const parameterKeys = {
	red: 'red',
	green: 'green',
	blue: 'blue',
	shape: 'shape',
	waveSizeAmount: 'harmonics amount',
	speedAmount: 'inharmonics amount',
	rotationAmount: 'rotation amount',
	phaseOffsetAmount: 'phase offset amount',
};

export const inletKeys = {
	red: 'red',
	green: 'green',
	blue: 'blue',
	waveSize: 'harmonics',
	speed: 'inharmonics',
	rotation: 'rotation',
	phaseOffset: 'phase offset',
};

export const oscillator: VideoModule<ShaderModule> = {
	parameters: {
		keys: Object.keys(parameterKeys),
		defaultValues: {
			[parameterKeys.waveSizeAmount]: 1,
			[parameterKeys.speedAmount]: 1,
			[parameterKeys.red]: 1,
			[parameterKeys.green]: 0,
			[parameterKeys.blue]: 0,
			[parameterKeys.shape]: 0,
			[parameterKeys.rotationAmount]: 0,
			[parameterKeys.phaseOffsetAmount]: 0,
		}
	},

	inlets: {
		keys: [
			inletKeys.red,
			inletKeys.green,
			inletKeys.blue,
			inletKeys.waveSize,
			inletKeys.speed,
			inletKeys.rotation,
			inletKeys.phaseOffset,
		],

		associatedParameters: {
			[inletKeys.red]: [parameterKeys.red],
			[inletKeys.green]: [parameterKeys.green],
			[inletKeys.blue]: [parameterKeys.blue],
			[inletKeys.waveSize]: [parameterKeys.waveSizeAmount],
			[inletKeys.speed]: [parameterKeys.speedAmount],
			[inletKeys.rotation]: [parameterKeys.rotationAmount],
			[inletKeys.phaseOffset]: [parameterKeys.phaseOffsetAmount],
		}
	},

	details: {
		type: 'shader',

		shaderSource,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),

		parametersToUniforms: values => ({
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

		inletsToUniforms: {
			[inletKeys.red]: 'red',
			[inletKeys.green]: 'green',
			[inletKeys.blue]: 'blue',
			[inletKeys.waveSize]: 'waveSize',
			[inletKeys.speed]: 'speed',
			[inletKeys.rotation]: 'rotationTheta',
			[inletKeys.phaseOffset]: 'phaseOffsetTexture',
		},
	}

};

