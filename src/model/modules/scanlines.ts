import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/scanlines';

export const parameterKeys = {
	ditherAmount: 'dither amount',
	rotationAmount: 'rotation amount',
	phaseOffsetAmount: 'phase offset amount',
};

export const inletKeys = {
	rotation: 'rotation',
	phaseOffset: 'phaseOffset',
};

export const scanlines: VideoModule<ShaderModule> = {
	name: 'scanlines',

	description: 'Outputs a gradient, where each pixel value represents the amount of time it would take for a scanline to reach it.',
	parameters: {
		keys: [
			parameterKeys.rotationAmount,
			parameterKeys.phaseOffsetAmount,
			parameterKeys.ditherAmount,
		],
		defaultValues: {
			[parameterKeys.rotationAmount]: 0,
			[parameterKeys.phaseOffsetAmount]: 0,
			[parameterKeys.ditherAmount]: 0,
		}
	},

	inlets: {
		keys: [inletKeys.rotation, inletKeys.phaseOffset],
		associatedParameters: {
			[inletKeys.rotation]: parameterKeys.rotationAmount,
			[inletKeys.phaseOffset]: parameterKeys.phaseOffsetAmount,
		},
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
		}),

		inletsToUniforms: {
			[inletKeys.rotation]: 'rotationTheta',
			[inletKeys.phaseOffset]: 'phaseOffsetTexture',
		}
	}
};

