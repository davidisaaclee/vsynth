import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/gaussianBlur.generated';

export const parameterKeys = {
	input: 'input',
	dx: 'dx',
	dy: 'dy',
};

export const inletKeys = {
	input: 'input',
	dx: 'dx',
	dy: 'dy',
};

export const singlePassBlur: VideoModule<ShaderModule> = {
	name: 'singlepass blur',

	description: 'Applies a Gaussian blur to its input in one direction.',

	parameters: {
		keys: [
			parameterKeys.input,
			parameterKeys.dx,
			parameterKeys.dy,
		],
		defaultValues: {
			[parameterKeys.input]: 1,
			[parameterKeys.dx]: 1,
			[parameterKeys.dy]: 1,
		}
	},

	inlets: {
		keys: [
			inletKeys.input,
			inletKeys.dx,
			inletKeys.dy,
		],
		associatedParameters: {
			[inletKeys.input]: parameterKeys.input,
			[inletKeys.dx]: parameterKeys.dx,
			[inletKeys.dy]: parameterKeys.dy,
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
			tAmount: {
				type: 'f',
				data: values[parameterKeys.input]
			},
			dxAmount: {
				type: 'f',
				data: values[parameterKeys.dx],
			},
			dyAmount: {
				type: 'f',
				data: values[parameterKeys.dy],
			},
		}),

		inletsToUniforms: {
			[inletKeys.input]: 't',
			[inletKeys.dx]: 'dx',
			[inletKeys.dy]: 'dy',
		}
	}
};

