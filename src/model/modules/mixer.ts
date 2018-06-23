import { VideoModule, shaderVideoModule } from '../VideoModule';
import shaderSource from '../../shaders/mixer';

const parameterKeys = {
	mixAmount: 'mix amount',
};

export const mixer: VideoModule = shaderVideoModule({
	shaderSource,
	parameters: {
		specifications: {
			[parameterKeys.mixAmount]: {
				initialValue: () => 0.5,
			}
		},
		toUniforms: values => ({
			'mixAmount': {
				type: 'f',
				data: values[parameterKeys.mixAmount]
			}
		})
	},
	inlets: {
		uniformMappings: {
			'a': 'inputA',
			'b': 'inputB',
		},
		displayOrder: ['a', 'b']
	}
});

