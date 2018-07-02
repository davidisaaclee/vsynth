import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/oscillator.generated';

export const parameterKeys = {
	hue: 'hue',
	shape: 'shape',
	waveSizeAmount: 'harmonics amount',
	speedAmount: 'inharmonics amount',
	rotationAmount: 'rotation amount',
	phaseOffsetAmount: 'phase offset amount',
};

export const inletKeys = {
	hue: 'hue',
	waveSize: 'harmonics',
	speed: 'inharmonics',
	shape: 'shape',
	rotation: 'rotation',
	phaseOffset: 'phase offset',
};

export const oscillator: VideoModule<ShaderModule> = {
	parameters: {
		keys: Object.keys(parameterKeys),
		defaultValues: {
			[parameterKeys.waveSizeAmount]: 1,
			[parameterKeys.speedAmount]: 1,
			[parameterKeys.hue]: 1,
			[parameterKeys.shape]: 0,
			[parameterKeys.rotationAmount]: 0,
			[parameterKeys.phaseOffsetAmount]: 0,
		}
	},

	inlets: {
		keys: [
			inletKeys.hue,
			inletKeys.waveSize,
			inletKeys.speed,
			inletKeys.shape,
			inletKeys.rotation,
			inletKeys.phaseOffset,
		],

		associatedParameters: {
			[inletKeys.hue]: parameterKeys.hue,
			[inletKeys.waveSize]: parameterKeys.waveSizeAmount,
			[inletKeys.speed]: parameterKeys.speedAmount,
			[inletKeys.shape]: parameterKeys.shape,
			[inletKeys.rotation]: parameterKeys.rotationAmount,
			[inletKeys.phaseOffset]: parameterKeys.phaseOffsetAmount,
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
			shapeAmount: {
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
			hueAmount: {
				type: 'f',
				data: values[parameterKeys.hue]
			},
		}),

		inletsToUniforms: {
			[inletKeys.hue]: 'hue',
			[inletKeys.waveSize]: 'waveSize',
			[inletKeys.speed]: 'speed',
			[inletKeys.shape]: 'shape',
			[inletKeys.rotation]: 'rotationTheta',
			[inletKeys.phaseOffset]: 'phaseOffsetTexture',
		},
	}

};

