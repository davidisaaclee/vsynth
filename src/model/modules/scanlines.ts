import { VideoModule, ShaderModule, ModuleConfigurationType } from '../VideoModule';
import shaderSource from '../../shaders/scanlines.generated';

export const parameterKeys = {
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
		],
		defaultValues: {
			[parameterKeys.rotationAmount]: 0,
			[parameterKeys.phaseOffsetAmount]: 0,
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
		type: ModuleConfigurationType.shader,

		shaderSource,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
			'reciprocalInputTextureDimensions': {
				type: '2f',
				data: [1 / gl.canvas.width, 1 / gl.canvas.height]
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
		}),

		inletsToUniforms: {
			[inletKeys.rotation]: 'rotationTheta',
			[inletKeys.phaseOffset]: 'phaseOffsetTexture',
		}
	}
};

