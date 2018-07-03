import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/zoomIn.generated';

export const inletKeys = {
	input: 'input',
	scale: 'scale',
};

export const zoomIn: VideoModule<ShaderModule> = {
	parameters: {
		keys: [
			inletKeys.scale,
			inletKeys.input,
		],
		defaultValues: {
			[inletKeys.input]: 1,
			[inletKeys.scale]: 0,
		},
	},

	inlets: {
		keys: [inletKeys.input, inletKeys.scale],
		associatedParameters: {
			[inletKeys.input]: inletKeys.input,
			[inletKeys.scale]: inletKeys.scale,
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

		parametersToUniforms: (values) => ({
			'inputAmount': {
				type: 'f',
				data: values[inletKeys.input],
			},
			'scaleAmount': {
				type: 'f',
				data: values[inletKeys.scale],
			},
		}),

		inletsToUniforms: {
			[inletKeys.input]: 'inputTexture',
			[inletKeys.scale]: 'scaleTexture',
		}
	}
};

