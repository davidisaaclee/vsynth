import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/mixer';

export const parameterKeys = {
	mixAmount: 'mix amount',
};

export const inletKeys = {
	a: 'a',
	b: 'b',
};

export const mixer: VideoModule<ShaderModule> = {
	parameters: {
		keys: [parameterKeys.mixAmount],
		defaultValues: {
			[parameterKeys.mixAmount]: 0.5,
		},
	},

	inlets: {
		keys: [inletKeys.a, inletKeys.b],
		associatedParameters: {},
	},

	details: {
		type: 'shader',

		shaderSource,

		defaultUniforms: () => ({}),

		parametersToUniforms: values => ({
			'mixAmount': {
				type: 'f',
				data: values[parameterKeys.mixAmount]
			}
		}),

		inletsToUniforms: {
			[inletKeys.a]: 'inputA',
			[inletKeys.b]: 'inputB',
		}
	}
};

