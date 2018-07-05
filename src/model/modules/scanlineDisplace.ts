import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/scanlineDisplace.generated';

export const inletKeys = {
	input: 'input',
	displace: 'displace',
};

export const scanlineDisplace: VideoModule<ShaderModule> = {
	description: 'Displaces each pixel by adding the horizontal displace factor and wrapping around the screen.',

	parameters: {
		keys: [
			inletKeys.input,
			inletKeys.displace,
		],
		defaultValues: {
			[inletKeys.input]: 1,
			[inletKeys.displace]: 0,
		}
	},

	inlets: {
		keys: [inletKeys.input, inletKeys.displace],
		associatedParameters: {
			[inletKeys.input]: inletKeys.input,
			[inletKeys.displace]: inletKeys.displace,
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
			'inputAmount': {
				type: 'f',
				data: values[inletKeys.input]
			},
			'displaceAmount': {
				type: 'f',
				data: values[inletKeys.displace]
			},
		}),

		inletsToUniforms: {
			[inletKeys.input]: 'inputTexture',
			[inletKeys.displace]: 'displaceTexture',
		}
	}
};

