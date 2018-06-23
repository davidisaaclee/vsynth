import { ShaderModule } from '../VideoModule';
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

export const oscillator: ShaderModule = {
	shaderSource,

	parameters: {
		keys: Object.keys(parameterKeys),
		defaultValues: {
			[parameterKeys.waveSizeAmount]: 0.5,
			[parameterKeys.speedAmount]: 0.5,
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
	},

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
		'waveSize': 'waveSize',
		'speed': 'speed',
		'rotation': 'rotationTheta',
		'phase offset': 'phaseOffsetTexture',
	},

};

