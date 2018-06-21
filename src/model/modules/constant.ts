import { VideoModule } from '../VideoModule';
import shaderSource from '../../shaders/constant';

const parameterKeys = {
	value: 'value',
};

export const constant: VideoModule = {
	shaderSource,
	parameters: {
		specifications: {
			[parameterKeys.value]: {
				initialValue: () => 1,
			}
		},
		toUniforms: values => ({
			'value': {
				type: '3f',
				data: [values[parameterKeys.value], values[parameterKeys.value], values[parameterKeys.value]]
			}
		})
	},
};
