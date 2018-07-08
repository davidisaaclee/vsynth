import { VideoModule, ShaderModule, ModuleConfigurationType } from '../VideoModule';
import identityShader from '../../shaders/identity';

export const identity: VideoModule<ShaderModule> = {
	name: 'identity',
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
		type: ModuleConfigurationType.shader,

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
