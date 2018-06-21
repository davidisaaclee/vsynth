import { VideoModule } from '../VideoModule';
import shaderSource from '../../shaders/scanlines';

const parameterKeys = {
	ditherAmount: 'dither amount',
	rotationAmount: 'rotation amount',
	phaseOffsetAmount: 'phase offset amount',
};

export const scanlines: VideoModule = {
	shaderSource,
	parameters: {
		specifications: {
			[parameterKeys.rotationAmount]: {
				initialValue: () => 0,
			},
			[parameterKeys.phaseOffsetAmount]: {
				initialValue: () => 0,
			},
			[parameterKeys.ditherAmount]: {
				initialValue: () => 0,
			},
		},
		toUniforms: values => ({
			rotationAmount: {
				type: 'f',
				data: values[parameterKeys.rotationAmount]
			},
			phaseOffsetTextureAmount: {
				type: 'f',
				data: values[parameterKeys.phaseOffsetAmount]
			},
			'ditherAmount': {
				type: 'f',
				data: values[parameterKeys.ditherAmount]
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
		associatedParameters: {
			'rotation': [parameterKeys.rotationAmount],
			'phase offset': [parameterKeys.phaseOffsetAmount],
		}
	}
};

