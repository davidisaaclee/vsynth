import { VideoModule, shaderVideoModule } from '../VideoModule';
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

export const oscillator: VideoModule = shaderVideoModule({
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
});

