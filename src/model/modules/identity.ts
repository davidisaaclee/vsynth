import { VideoModule, ShaderModule } from '../VideoModule';
import identityShader from '../../shaders/identity';

export const identity: VideoModule<ShaderModule> = {
	description: 'Outputs its input.',
	parameters: {
		keys: [],
		defaultValues: {},
	},

	inlets: {
		keys: ['output'],
		associatedParameters: {}
	},

	details: {
		type: 'shader',

		shaderSource: identityShader,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),

		parametersToUniforms: () => ({}),

		inletsToUniforms: {
			'output': 'inputTexture'
		},
	},
};
