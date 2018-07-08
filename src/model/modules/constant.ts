import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/constant';

const parameterKeys = {
	value: 'value',
};

export const constant: VideoModule<ShaderModule> = {
	name: 'constant',
	description: "Outputs a constant value.",

	parameters: {
		keys: [parameterKeys.value],
		defaultValues: {
			[parameterKeys.value]: 1
		}
	},

	inlets: {
		keys: [],
		associatedParameters: {},
	},

	details: {
		type: 'shader',

		shaderSource,

		defaultUniforms: () => ({}),

		inletsToUniforms: {},

		parametersToUniforms: values => ({
			'value': {
				type: '3f',
				data: [values[parameterKeys.value], values[parameterKeys.value], values[parameterKeys.value]]
			}
		}),
	}
};

