import { VideoModule, ShaderModule, ModuleConfigurationType } from '../VideoModule';
import shaderSource from '../../shaders/modulo.generated';

export const inletKeys = {
	dividend: 'dividend',
	divisor: 'divisor',
};

export const modulo: VideoModule<ShaderModule> = {
	name: '%',

	description: 'Outputs the result of the dividend mod the divisor.',

	parameters: {
		keys: [
			inletKeys.dividend,
			inletKeys.divisor,
		],
		defaultValues: {
			[inletKeys.dividend]: 1,
			[inletKeys.divisor]: 1,
		}
	},

	inlets: {
		keys: [inletKeys.dividend, inletKeys.divisor],
		associatedParameters: {
			[inletKeys.dividend]: inletKeys.dividend,
			[inletKeys.divisor]: inletKeys.divisor,
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
		}),

		parametersToUniforms: values => ({
			'dividendAmount': {
				type: 'f',
				data: values[inletKeys.dividend]
			},
			'divisorAmount': {
				type: 'f',
				data: values[inletKeys.divisor]
			},
		}),

		inletsToUniforms: {
			[inletKeys.dividend]: 'dividendTexture',
			[inletKeys.divisor]: 'divisorTexture',
		}
	}
};

